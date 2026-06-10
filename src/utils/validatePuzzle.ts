import type { Direction, PublicPuzzle, Puzzle, PuzzleAnswers } from "../puzzles/schema";

const directions: Direction[] = ["across", "down"];

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

export function validatePuzzleSources(publicPuzzles: PublicPuzzle[], answerPuzzles: PuzzleAnswers[]) {
  const ids = new Set<string>();
  const dates = new Set<string>();
  const answerIds = new Set(answerPuzzles.map((puzzle) => puzzle.id));
  const errors: string[] = [];

  publicPuzzles.forEach((puzzle) => {
    if (ids.has(puzzle.id)) errors.push(`Duplicate public puzzle id "${puzzle.id}".`);
    if (dates.has(puzzle.date)) errors.push(`Duplicate public puzzle date "${puzzle.date}".`);
    if (!answerIds.has(puzzle.id)) errors.push(`${puzzle.id}: missing matching answer file.`);
    ids.add(puzzle.id);
    dates.add(puzzle.date);
    errors.push(...validatePublicPuzzle(puzzle));
  });

  answerPuzzles.forEach((answers) => {
    const publicPuzzle = publicPuzzles.find((puzzle) => puzzle.id === answers.id);
    if (!publicPuzzle) errors.push(`${answers.id}: answer file has no matching public puzzle.`);
    if (publicPuzzle && publicPuzzle.date !== answers.date) {
      errors.push(`${answers.id}: public date ${publicPuzzle.date} does not match answer date ${answers.date}.`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Invalid puzzle JSON:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}

function validatePublicPuzzle(puzzle: PublicPuzzle) {
  const errors: string[] = [];
  if (puzzle.layout.length !== puzzle.size.rows) {
    errors.push(`${puzzle.id}: expected ${puzzle.size.rows} layout rows, found ${puzzle.layout.length}.`);
  }

  puzzle.layout.forEach((row, rowIndex) => {
    if (row.length !== puzzle.size.cols) {
      errors.push(`${puzzle.id}: layout row ${rowIndex + 1} expected ${puzzle.size.cols} cells, found ${row.length}.`);
    }
    row.forEach((cell, colIndex) => {
      if (cell !== "." && cell !== "#") {
        errors.push(`${puzzle.id}: layout cell ${rowIndex},${colIndex} must be "." or "#".`);
      }
    });
  });

  directions.forEach((direction) => {
    const numbers = new Set<number>();
    puzzle.clues[direction].forEach((clue) => {
      if (numbers.has(clue.number)) errors.push(`${puzzle.id}: duplicate ${direction} clue number ${clue.number}.`);
      numbers.add(clue.number);
      if (!clue.prompt.text && !clue.prompt.imageSrc) {
        errors.push(`${puzzle.id}: ${direction} ${clue.number} needs text or image prompt.`);
      }
      if (clue.prompt.imageSrc) {
        if (!clue.prompt.imageAlt?.trim()) {
          errors.push(`${puzzle.id}: ${direction} ${clue.number} image clue needs imageAlt.`);
        }
        if (!isSafeLocalImagePath(clue.prompt.imageSrc)) {
          errors.push(`${puzzle.id}: ${direction} ${clue.number} imageSrc must be a safe local path.`);
        }
      }
    });
  });

  return errors;
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

  puzzle.layout.forEach((row, rowIndex) => {
    row.forEach((layoutCell, colIndex) => {
      const solutionCell = puzzle.cells[rowIndex]?.[colIndex];
      if (layoutCell === "#" && solutionCell !== null) {
        errors.push(`${puzzle.id}: blocked layout cell ${rowIndex},${colIndex} must have null solution.`);
      }
      if (layoutCell === "." && (solutionCell === null || solutionCell === undefined)) {
        errors.push(`${puzzle.id}: open layout cell ${rowIndex},${colIndex} needs a solution letter.`);
      }
    });
  });

  directions.forEach((direction) => {
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

function isSafeLocalImagePath(path: string) {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("..") &&
    !/^https?:\/\//i.test(path) &&
    /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(path)
  );
}
