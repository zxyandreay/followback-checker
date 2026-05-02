import JSZip from "jszip";
import {
  extractUsernameFromRelationshipItem,
} from "@/lib/instagram-username";

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

const IGNORED_RELATIONSHIP_BASENAMES = new Set(
  [
    "recently_unfollowed_profiles.json",
    "removed_suggestions.json",
    "blocked_profiles.json",
    "close_friends.json",
    "pending_follow_requests.json",
    "recent_follow_requests.json",
    "custom_lists.json",
  ].map((s) => s.toLowerCase()),
);

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function basenameFromPath(path: string): string {
  const n = normalizeZipPath(path);
  const i = n.lastIndexOf("/");
  return i === -1 ? n : n.slice(i + 1);
}

function isIgnoredBasename(basename: string): boolean {
  return IGNORED_RELATIONSHIP_BASENAMES.has(basename.toLowerCase());
}

function isFollowingBasename(basename: string): boolean {
  const lower = basename.toLowerCase();
  return lower === "following.json" || /^following_.+\.json$/i.test(basename);
}

function isFollowersBasename(basename: string): boolean {
  return /^followers_.+\.json$/i.test(basename);
}

/** ZIP: ingest following.json / following_*.json / followers_*.json (not denylisted), any path under export. */
function zipMemberMatchesExportBasename(normalizedPath: string): boolean {
  const base = basenameFromPath(normalizedPath);
  if (!base.toLowerCase().endsWith(".json")) return false;
  if (isIgnoredBasename(base)) return false;
  return isFollowingBasename(base) || isFollowersBasename(base);
}

type ParsedShard = {
  rawEntryCount: number;
  parsedCount: number;
  usernames: string[];
};

function parseFollowersPayload(data: unknown): ParsedShard {
  let items: unknown[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data !== null && typeof data === "object") {
    const rf = (data as Record<string, unknown>).relationships_followers;
    if (Array.isArray(rf)) items = rf;
  }

  const usernames: string[] = [];
  for (const item of items) {
    const u = extractUsernameFromRelationshipItem(item);
    if (u) usernames.push(u);
  }

  return {
    rawEntryCount: items.length,
    parsedCount: usernames.length,
    usernames,
  };
}

function parseFollowingPayload(data: unknown): ParsedShard {
  let items: unknown[] = [];
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const rf = (data as Record<string, unknown>).relationships_following;
    if (Array.isArray(rf)) items = rf;
  }

  const usernames: string[] = [];
  for (const item of items) {
    const u = extractUsernameFromRelationshipItem(item);
    if (u) usernames.push(u);
  }

  return {
    rawEntryCount: items.length,
    parsedCount: usernames.length,
    usernames,
  };
}

function parseFollowersJsonText(text: string): ParsedShard {
  const data: unknown = JSON.parse(text);
  return parseFollowersPayload(data);
}

function parseFollowingJsonText(text: string): ParsedShard {
  const data: unknown = JSON.parse(text);
  return parseFollowingPayload(data);
}

type ParseDiagnostics = {
  followerFilesFound: number;
  followingFilesFound: number;
  rawFollowerEntries: number;
  rawFollowingEntries: number;
  parsedFollowersPerFile: number;
  parsedFollowingPerFile: number;
  uniqueFollowers: number;
  uniqueFollowing: number;
};

function formatDiagnostics(d: ParseDiagnostics): string {
  return [
    `Follower files found: ${d.followerFilesFound} · Following files found: ${d.followingFilesFound}`,
    `Follower entries (raw): ${d.rawFollowerEntries} · Parsed followers (before dedupe): ${d.parsedFollowersPerFile} · Unique followers: ${d.uniqueFollowers}`,
    `Following entries (raw): ${d.rawFollowingEntries} · Parsed following (before dedupe): ${d.parsedFollowingPerFile} · Unique following: ${d.uniqueFollowing}`,
  ].join("\n");
}

function mergeUnique(usernames: string[]): string[] {
  return [...new Set(usernames)];
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

    if (!zipMemberMatchesExportBasename(normalized)) continue;

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

async function collectFromZipFile(file: File): Promise<{
  followingTexts: string[];
  followerTexts: string[];
  jsonEntryCount: number;
  matchedPathCount: number;
}> {
  const buffer = await file.arrayBuffer();
  return readZipEntries(buffer);
}

async function classifyLooseJsonFile(
  file: File,
  text: string,
): Promise<"following" | "followers" | null> {
  const base = basenameFromPath(file.name);
  const lower = base.toLowerCase();

  if (!lower.endsWith(".json")) return null;
  if (isIgnoredBasename(base)) return null;

  if (isFollowingBasename(base)) return "following";
  if (isFollowersBasename(base)) return "followers";

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.relationships_following)) return "following";
    if (Array.isArray(o.relationships_followers)) return "followers";
  }

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
      const text = await file.text();
      const kind = await classifyLooseJsonFile(file, text);
      if (!kind) continue;
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
  let rawFollowingEntries = 0;
  let rawFollowerEntries = 0;
  let parsedFollowingPerFile = 0;
  let parsedFollowersPerFile = 0;

  try {
    for (const t of followingTexts) {
      const shard = parseFollowingJsonText(t);
      rawFollowingEntries += shard.rawEntryCount;
      parsedFollowingPerFile += shard.parsedCount;
      followingUsernames.push(...shard.usernames);
    }
    for (const t of followerTexts) {
      const shard = parseFollowersJsonText(t);
      rawFollowerEntries += shard.rawEntryCount;
      parsedFollowersPerFile += shard.parsedCount;
      followerUsernames.push(...shard.usernames);
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

  const diagnostics: ParseDiagnostics = {
    followerFilesFound: followerTexts.length,
    followingFilesFound: followingTexts.length,
    rawFollowerEntries,
    rawFollowingEntries,
    parsedFollowersPerFile,
    parsedFollowingPerFile,
    uniqueFollowers: followerUsernames.length,
    uniqueFollowing: followingUsernames.length,
  };
  const diagBlock = formatDiagnostics(diagnostics);

  if (followingUsernames.length === 0) {
    return {
      ok: false,
      message:
        "Following files were found but no usernames could be read. Check that entries use title, value, or profile links Instagram expects.\n\n" +
        diagBlock,
    };
  }

  if (followerUsernames.length === 0) {
    return {
      ok: false,
      message:
        "Follower files were found but no usernames could be read. Check that entries use value, title, or profile links Instagram expects.\n\n" +
        diagBlock,
    };
  }

  return {
    ok: true,
    followingUsernames,
    followerUsernames,
  };
}
