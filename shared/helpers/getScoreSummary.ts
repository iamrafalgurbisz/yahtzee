import {
  LOWER_CATEGORIES,
  UPPER_CATEGORIES,
  type Category,
} from "@shared/types/gameCategories";

export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS = 50;

type Scores = { [C in Category]?: number | null };

const sumOf = (scores: Scores, categories: readonly Category[]) =>
  categories.reduce((acc, c) => acc + (scores[c] ?? 0), 0);

export const getScoreSummary = (scores: Scores) => {
  const upper = sumOf(scores, UPPER_CATEGORIES);
  const bonus = upper >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS : 0;
  const lower = sumOf(scores, LOWER_CATEGORIES);

  return { upper, bonus, lower, total: upper + bonus + lower };
};

export type ScoreSummary = ReturnType<typeof getScoreSummary>;
