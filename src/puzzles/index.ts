import today from "./2026-06-10";
import type { Puzzle } from "./schema";
import { validatePuzzles } from "../utils/validatePuzzle";

export const puzzles: Puzzle[] = [today].sort((a, b) => a.date.localeCompare(b.date));

if (import.meta.env.DEV) {
  validatePuzzles(puzzles);
}

export function getPuzzleForDate(date: string) {
  return puzzles.find((puzzle) => puzzle.date === date);
}

export function getMostRecentPuzzle(beforeOrOn: string) {
  return [...puzzles].reverse().find((puzzle) => puzzle.date <= beforeOrOn);
}
