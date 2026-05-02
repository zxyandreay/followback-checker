import { describe, expect, it } from "vitest";
import { parseInstagramExportFromFiles } from "./instagram-export";

describe("parseInstagramExportFromFiles", () => {
  it("parses loose following.json + followers_1.json shapes", async () => {
    const followersJson = JSON.stringify([
      {
        title: "",
        string_list_data: [
          {
            href: "https://www.instagram.com/edzz2_2",
            value: "edzz2_2",
            timestamp: 1773296472,
          },
        ],
      },
      {
        title: "",
        string_list_data: [
          {
            href: "https://www.instagram.com/x_ielxx",
            value: "x_ielxx",
            timestamp: 1773175448,
          },
        ],
      },
    ]);

    const followingJson = JSON.stringify({
      relationships_following: [
        {
          title: "unearthly.hub",
          string_list_data: [
            {
              href: "https://www.instagram.com/_u/unearthly.hub",
              timestamp: 1775470267,
            },
          ],
        },
        {
          title: "edzz2_2",
          string_list_data: [
            {
              href: "https://www.instagram.com/_u/edzz2_2",
              timestamp: 1,
            },
          ],
        },
      ],
    });

    const result = await parseInstagramExportFromFiles([
      new File([followersJson], "followers_1.json", { type: "application/json" }),
      new File([followingJson], "following.json", { type: "application/json" }),
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.followerUsernames.sort()).toEqual(["edzz2_2", "x_ielxx"]);
    expect(result.followingUsernames.sort()).toEqual(["edzz2_2", "unearthly.hub"]);
  });

  it("classifies following by relationships_following without standard filename", async () => {
    const followingJson = JSON.stringify({
      relationships_following: [
        {
          title: "only.title",
          string_list_data: [{ href: "https://www.instagram.com/_u/only.title", timestamp: 1 }],
        },
      ],
    });

    const followersJson = JSON.stringify([
      {
        title: "",
        string_list_data: [
          { href: "https://www.instagram.com/a", value: "a", timestamp: 1 },
        ],
      },
    ]);

    const result = await parseInstagramExportFromFiles([
      new File([followersJson], "followers_9.json", { type: "application/json" }),
      new File([followingJson], "unknown.json", { type: "application/json" }),
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.followingUsernames).toContain("only.title");
  });

  it("ignores denylisted loose JSON basenames", async () => {
    const closeFriends = JSON.stringify({ relationships_following: [] });
    const followersJson = JSON.stringify([
      {
        title: "",
        string_list_data: [{ href: "https://www.instagram.com/z", value: "z", timestamp: 1 }],
      },
    ]);
    const followingJson = JSON.stringify({
      relationships_following: [
        {
          title: "y",
          string_list_data: [{ href: "https://www.instagram.com/_u/y", timestamp: 1 }],
        },
      ],
    });

    const result = await parseInstagramExportFromFiles([
      new File([followersJson], "followers_1.json", { type: "application/json" }),
      new File([followingJson], "following.json", { type: "application/json" }),
      new File([closeFriends], "close_friends.json", { type: "application/json" }),
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.followingUsernames).toEqual(["y"]);
    expect(result.followerUsernames).toEqual(["z"]);
  });
});
