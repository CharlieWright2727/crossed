export type CellValue = string | null;

export type Direction = "across" | "down";

export type CluePrompt = {
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCredit?: string;
};

export type PublicClue = {
  number: number;
  prompt: CluePrompt;
  row: number;
  col: number;
};

export type PublicPuzzle = {
  id: string;
  date: string;
  title: string;
  author?: string;
  difficulty?: "easy" | "medium" | "hard";
  size: { rows: number; cols: number };
  layout: ("." | "#")[][];
  clues: Record<Direction, PublicClue[]>;
};

export type AnswerClue = {
  number: number;
  answer: string;
  displayAnswer?: string;
};

export type PuzzleAnswers = {
  id: string;
  date: string;
  cells: CellValue[][];
  clues: Record<Direction, AnswerClue[]>;
};

export type Clue = PublicClue & {
  answer: string;
  displayAnswer?: string;
};

export type Puzzle = Omit<PublicPuzzle, "clues"> & {
  cells: CellValue[][];
  clues: Record<Direction, Clue[]>;
};
