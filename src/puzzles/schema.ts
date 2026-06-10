export type CellValue = string | null;

export type Direction = "across" | "down";

export type Clue = {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
};

export type Puzzle = {
  id: string;
  date: string;
  title: string;
  author?: string;
  difficulty?: "easy" | "medium" | "hard";
  size: { rows: number; cols: number };
  cells: CellValue[][];
  clues: Record<Direction, Clue[]>;
};
