import type { Puzzle } from "./schema";

const puzzle: Puzzle = {
  id: "2026-06-10",
  date: "2026-06-10",
  title: "Opening Tip",
  author: "NBA Crossword",
  difficulty: "easy",
  size: { rows: 3, cols: 3 },
  cells: [
    ["N", "B", "A"],
    ["B", "O", "S"],
    ["A", "S", "T"],
  ],
  clues: {
    across: [
      { number: 1, clue: "League for the Finals and All-Star Weekend", answer: "NBA", row: 0, col: 0 },
      { number: 4, clue: "Scoreboard abbreviation for Boston", answer: "BOS", row: 1, col: 0 },
      { number: 5, clue: "Box-score shorthand for an assist", answer: "AST", row: 2, col: 0 },
    ],
    down: [
      { number: 1, clue: "League where MVPs lift the Michael Jordan Trophy", answer: "NBA", row: 0, col: 0 },
      { number: 2, clue: "Celtics city abbreviation", answer: "BOS", row: 0, col: 1 },
      { number: 3, clue: "Assist abbreviation on a stat sheet", answer: "AST", row: 0, col: 2 },
    ],
  },
};

export default puzzle;
