import JSZip from "jszip";

export type InstagramParseSuccess = {
  ok: true;
  followingUsernames: string[];
  followerUsernames: string[];
};

export type InstagramParseFailure = {
  ok: false;
  message: string;
};

export type InstagramParseResult = InstagramParseSuccess | InstagramParseFailure;

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isFollowingBasename(basename: string): boolean {
  const lower = basename.toLowerCase();
  return lower === "following.json" || /^following_.+\.json$/i.test(basename);
}

function isFollowersBasename(basename: string): boolean {
  return /^followers_.+\.json$/i.test(basename);
}

function basenameFromPath(path: string): string {
  const n = normalizeZipPath(path);
  const i = n.lastIndexOf("/");
  return i === -1 ? n : n.slice(i + 1);
}

function isUnderFollowersAndFollowingFolder(normalizedPath: string): boolean {
  return normalizedPath.includes("followers_and_following/");
}

export function extractUsernamesFromInstagramConnectionsJson(
  text: string,
): string[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new SyntaxError("Invalid JSON");
  }

  const relationshipEntries: unknown[] = [];

  if (Array.isArray(data)) {
    relationshipEntries.push(...data);
  } else if (data !== null && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const following = o.relationships_following;
    const followers = o.relationships_followers;
    if (Array.isArray(following)) relationshipEntries.push(...following);
    if (Array.isArray(followers)) relationshipEntries.push(...followers);
  }

  const out: string[] = [];

  for (const item of relationshipEntries) {
    if (item === null || typeof item !== "object") continue;
    const sld = (item as Record<string, unknown>).string_list_data;
    if (!Array.isArray(sld)) continue;
    for (const entry of sld) {
      if (entry === null || typeof entry !== "object") continue;
      const value = (entry as { value?: unknown }).value;
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (trimmed.length === 0) continue;
      out.push(trimmed.toLowerCase());
    }
  }

  return out;
}

async function readZipEntries(zipBuffer: ArrayBuffer): Promise<{
  followingTexts: string[];
  followerTexts: string[];
  jsonEntryCount: number;
  matchedPathCount: number;
}> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipBuffer);
  } catch {
    throw new Error("ZIP_READ_FAILED");
  }

  const followingTexts: string[] = [];
  const followerTexts: string[] = [];
  let jsonEntryCount = 0;
  let matchedPathCount = 0;

  const names = Object.keys(zip.files);
  for (const name of names) {
    const entry = zip.files[name];
    if (!entry || entry.dir) continue;

    const normalized = normalizeZipPath(name);
    const base = basenameFromPath(normalized);

    if (!base.toLowerCase().endsWith(".json")) continue;
    jsonEntryCount += 1;

    if (!isUnderFollowersAndFollowingFolder(normalized)) continue;

    const isFollowing = isFollowingBasename(base);
    const isFollowers = isFollowersBasename(base);
    if (!isFollowing && !isFollowers) continue;

    matchedPathCount += 1;

    const text = await entry.async("string");
    if (isFollowing) followingTexts.push(text);
    else followerTexts.push(text);
  }

  return { followingTexts, followerTexts, jsonEntryCount, matchedPathCount };
}

function mergeUnique(usernames: string[]): string[] {
  return [...new Set(usernames)];
}

async function collectFromZipFile(file: File): Promise<{
  followingTexts: string[];
  followerTexts: string[];
  jsonEntryCount: number;
  matchedPathCount: number;
}> {
  const buffer = await file.arrayBuffer();
  return readZipEntries(buffer);
}

function classifyLooseJsonFile(file: File): "following" | "followers" | null {
  const base = basenameFromPath(file.name);
  if (!base.toLowerCase().endsWith(".json")) return null;
  if (isFollowingBasename(base)) return "following";
  if (isFollowersBasename(base)) return "followers";
  return null;
}

export async function parseInstagramExportFromFiles(
  files: File[],
): Promise<InstagramParseResult> {
  const followingTexts: string[] = [];
  const followerTexts: string[] = [];
  let zipHadJson = false;
  let zipMatchedAny = false;

  for (const file of files) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".zip")) {
      let collected;
      try {
        collected = await collectFromZipFile(file);
      } catch (e) {
        if (e instanceof Error && e.message === "ZIP_READ_FAILED") {
          return {
            ok: false,
            message:
              "Could not read that ZIP file. Make sure it is a valid Instagram data export archive.",
          };
        }
        throw e;
      }
      zipHadJson ||= collected.jsonEntryCount > 0;
      zipMatchedAny ||= collected.matchedPathCount > 0;
      followingTexts.push(...collected.followingTexts);
      followerTexts.push(...collected.followerTexts);
      continue;
    }

    if (name.endsWith(".json")) {
      const kind = classifyLooseJsonFile(file);
      if (!kind) continue;
      const text = await file.text();
      if (kind === "following") followingTexts.push(text);
      else followerTexts.push(text);
    }
  }

  if (followingTexts.length === 0 && followerTexts.length === 0) {
    const hadZip = files.some((f) => f.name.toLowerCase().endsWith(".zip"));
    if (hadZip && zipHadJson && !zipMatchedAny) {
      return {
        ok: false,
        message:
          'No follower/following JSON was found under connections/followers_and_following. Request your Instagram export in JSON format and include "Following & Followers".',
      };
    }
    if (hadZip && !zipHadJson) {
      return {
        ok: false,
        message:
          "That ZIP does not contain JSON files. Use Instagram’s JSON export (not HTML only).",
      };
    }
    return {
      ok: false,
      message:
        "No recognized export files found. Add the ZIP from Instagram or select following.json / following_*.json and followers_*.json from connections/followers_and_following.",
    };
  }

  if (followingTexts.length === 0) {
    return {
      ok: false,
      message:
        "Could not find following.json or following_*.json. Check that your export includes Following & Followers.",
    };
  }

  if (followerTexts.length === 0) {
    return {
      ok: false,
      message:
        "Could not find followers_*.json files. Check that your export includes Followers.",
    };
  }

  let followingUsernames: string[] = [];
  let followerUsernames: string[] = [];

  try {
    for (const t of followingTexts) {
      followingUsernames.push(...extractUsernamesFromInstagramConnectionsJson(t));
    }
    for (const t of followerTexts) {
      followerUsernames.push(...extractUsernamesFromInstagramConnectionsJson(t));
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        ok: false,
        message:
          "One of the JSON files could not be parsed. Make sure you are using the official Instagram JSON export.",
      };
    }
    throw e;
  }

  followingUsernames = mergeUnique(followingUsernames);
  followerUsernames = mergeUnique(followerUsernames);

  if (followingUsernames.length === 0) {
    return {
      ok: false,
      message:
        "Following files were found but no usernames could be read. This export format may be unsupported — use JSON format from Instagram’s Download Your Information.",
    };
  }

  return {
    ok: true,
    followingUsernames,
    followerUsernames,
  };
}
