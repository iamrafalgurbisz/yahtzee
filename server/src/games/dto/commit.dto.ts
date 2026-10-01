import { IsIn, IsInt } from "class-validator";
import { CATEGORIES } from "@shared/types/gameCategories";
import type { Category } from "@shared/types/gameCategories";

export class CommitDto {
  @IsIn(CATEGORIES)
  category: Category;
  @IsInt()
  score: number;
}
