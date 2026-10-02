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

export const MAX_SCORES: Record<Category, number> = {
  ones: 5,
  twos: 10,
  threes: 15,
  fours: 20,
  fives: 25,
  sixes: 30,
  one_pair: 12,
  two_pairs: 22,
  three_of_a_kind: 18,
  four_of_a_kind: 24,
  small_straight: 15,
  large_straight: 20,
  full_house: 28,
  chance: 30,
  yatzy: 50,
};
