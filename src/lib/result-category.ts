export type ResultCategoryId =
  | "following"
  | "followers"
  | "notFollowingBack"
  | "peopleYouDontFollowBack"
  | "mutuals";

export const CATEGORY_LABELS: Record<ResultCategoryId, string> = {
  following: "Following",
  followers: "Followers",
  notFollowingBack: "Not Following Back",
  peopleYouDontFollowBack: "People You Don’t Follow Back",
  mutuals: "Mutuals",
};
