export type CompareResult = {
  notFollowingBack: string[];
  fansYouDontFollowBack: string[];
  mutuals: string[];
};

export function compareFollowLists(
  followingUsernames: string[],
  followerUsernames: string[],
): CompareResult {
  const followingSet = new Set(followingUsernames);
  const followerSet = new Set(followerUsernames);

  const notFollowingBack = [...followingSet]
    .filter((u) => !followerSet.has(u))
    .sort((a, b) => a.localeCompare(b));

  const fansYouDontFollowBack = [...followerSet]
    .filter((u) => !followingSet.has(u))
    .sort((a, b) => a.localeCompare(b));

  const mutuals = [...followingSet]
    .filter((u) => followerSet.has(u))
    .sort((a, b) => a.localeCompare(b));

  return { notFollowingBack, fansYouDontFollowBack, mutuals };
}
