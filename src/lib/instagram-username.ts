/**
 * Instagram export relationship item → normalized username (lowercase).
 */

export function normalizeUsername(raw: string): string | null {
  let s = raw.trim();
  if (s.startsWith("@")) s = s.slice(1).trim();
  if (s.length === 0) return null;
  return s.toLowerCase();
}

export function usernameFromInstagramUrl(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;

  let pathPart: string;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (!host.endsWith("instagram.com")) {
      return null;
    }
    pathPart = u.pathname;
  } catch {
    return null;
  }

  pathPart = pathPart.replace(/\/+$/, "");
  const segments = pathPart.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  let i = 0;
  if (segments[i]?.toLowerCase() === "_u") i += 1;
  if (i >= segments.length) return null;

  return normalizeUsername(segments[i] ?? "");
}

export function extractUsernameFromRelationshipItem(item: unknown): string | null {
  if (item === null || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;

  const sld = o.string_list_data;
  const first =
    Array.isArray(sld) && sld.length > 0 && sld[0] !== null && typeof sld[0] === "object"
      ? (sld[0] as Record<string, unknown>)
      : null;

  const tryValue = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    return normalizeUsername(v);
  };

  if (first) {
    const fromSldValue = tryValue(first.value);
    if (fromSldValue) return fromSldValue;
  }

  const fromTitle = tryValue(o.title);
  if (fromTitle) return fromTitle;

  const fromTopValue = tryValue(o.value);
  if (fromTopValue) return fromTopValue;

  if (first && typeof first.href === "string") {
    const fromSldHref = usernameFromInstagramUrl(first.href);
    if (fromSldHref) return fromSldHref;
  }

  const fromItemHref = usernameFromInstagramUrl(typeof o.href === "string" ? o.href : "");
  if (fromItemHref) return fromItemHref;

  return null;
}
