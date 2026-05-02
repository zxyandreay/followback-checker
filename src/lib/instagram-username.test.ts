import { describe, expect, it } from "vitest";
import {
  extractUsernameFromRelationshipItem,
  normalizeUsername,
  usernameFromInstagramUrl,
} from "./instagram-username";

describe("normalizeUsername", () => {
  it("trims, strips @, lowercases", () => {
    expect(normalizeUsername("  @Edzz2_2 ")).toBe("edzz2_2");
  });

  it("keeps dots underscores digits", () => {
    expect(normalizeUsername("eaaa.jpg")).toBe("eaaa.jpg");
    expect(normalizeUsername("rolssss.1111")).toBe("rolssss.1111");
    expect(normalizeUsername("d1n0_.s4ur3xx")).toBe("d1n0_.s4ur3xx");
    expect(normalizeUsername("x_ielxx")).toBe("x_ielxx");
  });

  it("returns null for empty", () => {
    expect(normalizeUsername("   ")).toBeNull();
    expect(normalizeUsername("@")).toBeNull();
  });
});

describe("usernameFromInstagramUrl", () => {
  it("parses standard profile URL", () => {
    expect(
      usernameFromInstagramUrl("https://www.instagram.com/edzz2_2"),
    ).toBe("edzz2_2");
  });

  it("parses _u URL", () => {
    expect(
      usernameFromInstagramUrl(
        "https://www.instagram.com/_u/unearthly.hub",
      ),
    ).toBe("unearthly.hub");
  });

  it("strips query and trailing slash", () => {
    expect(
      usernameFromInstagramUrl(
        "https://instagram.com/some.user/?igshid=abc",
      ),
    ).toBe("some.user");
  });

  it("returns null for non-instagram", () => {
    expect(usernameFromInstagramUrl("https://example.com/u/x")).toBeNull();
  });
});

describe("extractUsernameFromRelationshipItem", () => {
  it("reads follower sample via value", () => {
    const item = {
      title: "",
      string_list_data: [
        {
          href: "https://www.instagram.com/edzz2_2",
          value: "edzz2_2",
          timestamp: 1773296472,
        },
      ],
    };
    expect(extractUsernameFromRelationshipItem(item)).toBe("edzz2_2");
  });

  it("reads following sample via title before href", () => {
    const item = {
      title: "unearthly.hub",
      string_list_data: [
        {
          href: "https://www.instagram.com/_u/unearthly.hub",
          timestamp: 1775470267,
        },
      ],
    };
    expect(extractUsernameFromRelationshipItem(item)).toBe("unearthly.hub");
  });

  it("falls back to href when title missing and no value", () => {
    const item = {
      title: "",
      string_list_data: [
        {
          href: "https://www.instagram.com/_u/backup_handle",
          timestamp: 1,
        },
      ],
    };
    expect(extractUsernameFromRelationshipItem(item)).toBe("backup_handle");
  });
});
