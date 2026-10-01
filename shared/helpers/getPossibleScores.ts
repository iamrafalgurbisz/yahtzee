import type { Category } from "@shared/types/gameCategories";

const count = (dice: number[], v: number) => dice.filter((d) => d === v).length;
const FACES = [1, 2, 3, 4, 5, 6];

export const getPossibleScores = (category: Category, dice: number[]) => {
  const sum = dice.reduce((a, b) => a + b, 0);
  const sorted = [...dice].sort().join("");
  const withAtLeast = (n: number) => FACES.filter((v) => count(dice, v) >= n);

  const scores: number[] = (() => {
    switch (category) {
      case "ones":
        return [count(dice, 1) * 1];
      case "twos":
        return [count(dice, 2) * 2];
      case "threes":
        return [count(dice, 3) * 3];
      case "fours":
        return [count(dice, 4) * 4];
      case "fives":
        return [count(dice, 5) * 5];
      case "sixes":
        return [count(dice, 6) * 6];

      case "one_pair":
        return withAtLeast(2).map((v) => v * 2);
      case "three_of_a_kind":
        return withAtLeast(3).map((v) => v * 3);
      case "four_of_a_kind":
        return withAtLeast(4).map((v) => v * 4);

      case "two_pairs": {
        const pairs = withAtLeast(2);
        return pairs.flatMap((a) =>
          pairs.filter((b) => b > a).map((b) => (a + b) * 2),
        );
      }

      case "full_house": {
        const three = FACES.find((v) => count(dice, v) === 3);
        const two = FACES.find((v) => count(dice, v) === 2);
        return three && two ? [sum] : [];
      }

      case "small_straight":
        return sorted === "12345" ? [15] : [];
      case "large_straight":
        return sorted === "23456" ? [20] : [];
      case "chance":
        return [sum];
      case "yatzy":
        return count(dice, dice[0]) === 5 ? [50] : [];
      default:
        return [0];
    }
  })();

  return [...new Set([0, ...scores])];
};
