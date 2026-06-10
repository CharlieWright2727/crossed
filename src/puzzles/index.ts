import type { AnswerClue, Direction, PublicClue, PublicPuzzle, Puzzle, PuzzleAnswers } from "./schema";
import { validatePuzzleSources, validatePuzzles } from "../utils/validatePuzzle";

const publicModules = import.meta.glob<PublicPuzzle>("../../content/puzzles/public/*.json", {
  eager: true,
  import: "default",
});

const answerModules = import.meta.glob<PuzzleAnswers>("../../content/puzzles/answers/*.answers.json", {
  eager: true,
  import: "default",
});

const publicPuzzles = Object.values(publicModules);
const answerPuzzles = Object.values(answerModules);

validatePuzzleSources(publicPuzzles, answerPuzzles);

export const puzzles: Puzzle[] = publicPuzzles.map(mergePuzzle).sort((a, b) => a.date.localeCompare(b.date));

validatePuzzles(puzzles);

export function getPuzzleForDate(date: string) {
  return puzzles.find((puzzle) => puzzle.date === date);
}

export function getMostRecentPuzzle(beforeOrOn: string) {
  return [...puzzles].reverse().find((puzzle) => puzzle.date <= beforeOrOn);
}

function mergePuzzle(publicPuzzle: PublicPuzzle): Puzzle {
  const answers = answerPuzzles.find((answerPuzzle) => answerPuzzle.id === publicPuzzle.id);
  if (!answers) {
    throw new Error(`Missing answer file for puzzle "${publicPuzzle.id}".`);
  }

  return {
    ...publicPuzzle,
    cells: answers.cells,
    clues: {
      across: mergeClues(publicPuzzle.clues.across, answers.clues.across, "across", publicPuzzle.id),
      down: mergeClues(publicPuzzle.clues.down, answers.clues.down, "down", publicPuzzle.id),
    },
  };
}

function mergeClues(publicClues: PublicClue[], answerClues: AnswerClue[], direction: Direction, puzzleId: string) {
  return publicClues.map((clue) => {
    const answer = answerClues.find((candidate) => candidate.number === clue.number);
    if (!answer) {
      throw new Error(`Missing ${direction} answer for clue ${clue.number} in puzzle "${puzzleId}".`);
    }
    return { ...clue, ...answer };
  });
}
