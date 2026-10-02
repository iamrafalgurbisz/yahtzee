export const CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "one_pair",
  "two_pairs",
  "three_of_a_kind",
  "four_of_a_kind",
  "small_straight",
  "large_straight",
  "full_house",
  "chance",
  "yatzy",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const UPPER_CATEGORIES = CATEGORIES.slice(0, 6);
export const LOWER_CATEGORIES = CATEGORIES.slice(6);
