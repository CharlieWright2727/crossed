import type { Direction, Puzzle } from "../puzzles/schema";

export function validatePuzzles(puzzles: Puzzle[]) {
  const ids = new Set<string>();
  const dates = new Set<string>();
  const errors = puzzles.flatMap((puzzle) => {
    const puzzleErrors = validatePuzzle(puzzle);
    if (ids.has(puzzle.id)) puzzleErrors.push(`Duplicate puzzle id "${puzzle.id}".`);
    if (dates.has(puzzle.date)) puzzleErrors.push(`Duplicate puzzle date "${puzzle.date}".`);
    ids.add(puzzle.id);
    dates.add(puzzle.date);
    return puzzleErrors;
  });

  if (errors.length > 0) {
    throw new Error(`Invalid puzzle files:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}

export function validatePuzzle(puzzle: Puzzle) {
  const errors: string[] = [];
  if (puzzle.cells.length !== puzzle.size.rows) {
    errors.push(`${puzzle.id}: expected ${puzzle.size.rows} rows, found ${puzzle.cells.length}.`);
  }

  puzzle.cells.forEach((row, rowIndex) => {
    if (row.length !== puzzle.size.cols) {
      errors.push(`${puzzle.id}: row ${rowIndex + 1} expected ${puzzle.size.cols} cells, found ${row.length}.`);
    }
  });

  (["across", "down"] as Direction[]).forEach((direction) => {
    const numbers = new Set<number>();
    puzzle.clues[direction].forEach((clue) => {
      if (numbers.has(clue.number)) {
        errors.push(`${puzzle.id}: duplicate ${direction} clue number ${clue.number}.`);
      }
      numbers.add(clue.number);

      const answer = clue.answer.toUpperCase();
      for (let i = 0; i < answer.length; i += 1) {
        const row = clue.row + (direction === "down" ? i : 0);
        const col = clue.col + (direction === "across" ? i : 0);
        const gridLetter = puzzle.cells[row]?.[col];
        if (gridLetter === undefined) {
          errors.push(`${puzzle.id}: ${direction} ${clue.number} answer "${answer}" runs outside the grid.`);
          break;
        }
        if (gridLetter === null) {
          errors.push(`${puzzle.id}: ${direction} ${clue.number} answer "${answer}" crosses a blocked cell at ${row},${col}.`);
          break;
        }
        if (gridLetter.toUpperCase() !== answer[i]) {
          errors.push(`${puzzle.id}: ${direction} ${clue.number} expected ${answer[i]} at ${row},${col}, found ${gridLetter}.`);
        }
      }
    });
  });

  return errors;
}
