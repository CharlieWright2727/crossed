import { useCallback, useEffect, useMemo, useState } from "react";
import type { Clue, Direction, Puzzle } from "../puzzles/schema";
import { saveCompletion, readStats, type LocalStats } from "./useLocalStats";

type Position = { row: number; col: number };
type EntryGrid = (string | null)[][];

function makeEmptyGrid(puzzle: Puzzle): EntryGrid {
  return puzzle.cells.map((row) => row.map((cell) => (cell === null ? null : "")));
}

function sameCell(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

export function useCrosswordGame(puzzle: Puzzle) {
  const [entries, setEntries] = useState<EntryGrid>(() => makeEmptyGrid(puzzle));
  const [selected, setSelected] = useState<Position>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<Direction>("across");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [incorrect, setIncorrect] = useState<Set<string>>(new Set());
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stats, setStats] = useState<LocalStats>(() => readStats());

  useEffect(() => {
    const first = firstOpenCell(puzzle);
    setEntries(makeEmptyGrid(puzzle));
    setSelected(first);
    setDirection(resolveDirectionForCell(puzzle, first, "across"));
    setRevealed(new Set());
    setIncorrect(new Set());
    setComplete(false);
    setStartedAt(Date.now());
    setElapsed(0);
  }, [puzzle]);

  useEffect(() => {
    if (complete) return undefined;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [complete, startedAt]);

  const activeClue = useMemo(() => findClueForCell(puzzle, selected, direction), [direction, puzzle, selected]);
  const activeCells = useMemo(() => (activeClue ? cellsForClue(activeClue, direction) : []), [activeClue, direction]);

  const isSolved = useCallback(
    (grid = entries) =>
      puzzle.cells.every((row, rowIndex) =>
        row.every((cell, colIndex) => cell === null || grid[rowIndex][colIndex]?.toUpperCase() === cell),
      ),
    [entries, puzzle],
  );

  const finishIfSolved = useCallback(
    (grid = entries) => {
      if (!complete && isSolved(grid)) {
        const finalSeconds = Math.floor((Date.now() - startedAt) / 1000);
        setComplete(true);
        setElapsed(finalSeconds);
        setStats(saveCompletion(puzzle.date, finalSeconds));
      }
    },
    [complete, entries, isSolved, puzzle.date, startedAt],
  );

  const toggleDirection = useCallback(() => {
    setDirection((current) => {
      const next = otherDirection(current);
      return findClueForCell(puzzle, selected, next) ? next : current;
    });
  }, [puzzle, selected]);

  const selectCell = useCallback(
    (row: number, col: number) => {
      if (puzzle.cells[row]?.[col] === null || puzzle.cells[row]?.[col] === undefined) return;
      const nextSelected = { row, col };
      if (sameCell(selected, nextSelected)) {
        toggleDirection();
        return;
      }
      setSelected(nextSelected);
      setDirection((current) => resolveDirectionForCell(puzzle, nextSelected, current));
    },
    [puzzle, selected, toggleDirection],
  );

  const moveFrom = useCallback(
    (from: Position, deltaRow: number, deltaCol: number) => {
      const next = nextOpenCell(puzzle, from, deltaRow, deltaCol);
      setSelected(next);
      setDirection((currentDirection) => resolveDirectionForCell(puzzle, next, currentDirection));
    },
    [puzzle],
  );

  const move = useCallback(
    (deltaRow: number, deltaCol: number) => {
      moveFrom(selected, deltaRow, deltaCol);
    },
    [moveFrom, selected],
  );

  const enterLetter = useCallback(
    (letter: string) => {
      const currentCell = selected;
      setEntries((current) => {
        const next = current.map((row) => [...row]);
        next[currentCell.row][currentCell.col] = letter.toUpperCase();
        window.setTimeout(() => finishIfSolved(next), 0);
        return next;
      });
      moveFrom(currentCell, direction === "down" ? 1 : 0, direction === "across" ? 1 : 0);
    },
    [direction, finishIfSolved, moveFrom, selected],
  );

  const backspace = useCallback(() => {
    setEntries((current) => {
      const next = current.map((row) => [...row]);
      if (next[selected.row][selected.col]) {
        next[selected.row][selected.col] = "";
      } else {
        const previous = nextOpenCell(puzzle, selected, direction === "down" ? -1 : 0, direction === "across" ? -1 : 0);
        next[previous.row][previous.col] = "";
        setSelected(previous);
      }
      return next;
    });
  }, [direction, puzzle, selected]);

  const revealCell = useCallback(() => {
    setEntries((current) => {
      const next = current.map((row) => [...row]);
      next[selected.row][selected.col] = puzzle.cells[selected.row][selected.col];
      setRevealed((cells) => new Set(cells).add(cellKey(selected)));
      window.setTimeout(() => finishIfSolved(next), 0);
      return next;
    });
  }, [finishIfSolved, puzzle, selected]);

  const revealWord = useCallback(() => {
    if (!activeClue) return;
    setEntries((current) => {
      const next = current.map((row) => [...row]);
      const nextRevealed = new Set(revealed);
      cellsForClue(activeClue, direction).forEach((cell) => {
        next[cell.row][cell.col] = puzzle.cells[cell.row][cell.col];
        nextRevealed.add(cellKey(cell));
      });
      setRevealed(nextRevealed);
      window.setTimeout(() => finishIfSolved(next), 0);
      return next;
    });
  }, [activeClue, direction, finishIfSolved, puzzle, revealed]);

  const checkPuzzle = useCallback(() => {
    const wrong = new Set<string>();
    entries.forEach((row, rowIndex) =>
      row.forEach((entry, colIndex) => {
        if (entry && entry.toUpperCase() !== puzzle.cells[rowIndex][colIndex]) wrong.add(`${rowIndex}-${colIndex}`);
      }),
    );
    setIncorrect(wrong);
    finishIfSolved();
  }, [entries, finishIfSolved, puzzle]);

  const reset = useCallback(() => {
    setEntries(makeEmptyGrid(puzzle));
    setRevealed(new Set());
    setIncorrect(new Set());
    setComplete(false);
    setStartedAt(Date.now());
    setElapsed(0);
  }, [puzzle]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (/^[a-z]$/i.test(event.key)) enterLetter(event.key);
      if (event.key === "Backspace") backspace();
      if (event.key === "ArrowUp") move(-1, 0);
      if (event.key === "ArrowDown") move(1, 0);
      if (event.key === "ArrowLeft") move(0, -1);
      if (event.key === "ArrowRight") move(0, 1);
      if (event.key === " " || event.key === "Enter") toggleDirection();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [backspace, enterLetter, move, toggleDirection]);

  return {
    entries,
    selected,
    direction,
    activeClue,
    activeCells,
    revealed,
    incorrect,
    elapsed,
    complete,
    stats,
    assisted: revealed.size > 0,
    selectCell,
    toggleDirection,
    enterLetter,
    backspace,
    revealCell,
    revealWord,
    checkPuzzle,
    reset,
    selectClue: (clue: Clue, nextDirection: Direction) => {
      setDirection(nextDirection);
      setSelected({ row: clue.row, col: clue.col });
    },
  };
}

function cellKey(cell: Position) {
  return `${cell.row}-${cell.col}`;
}

function firstOpenCell(puzzle: Puzzle): Position {
  for (let row = 0; row < puzzle.size.rows; row += 1) {
    for (let col = 0; col < puzzle.size.cols; col += 1) {
      if (puzzle.cells[row][col] !== null) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

function nextOpenCell(puzzle: Puzzle, current: Position, deltaRow: number, deltaCol: number) {
  let row = current.row;
  let col = current.col;
  for (let step = 0; step < puzzle.size.rows * puzzle.size.cols; step += 1) {
    row = Math.min(puzzle.size.rows - 1, Math.max(0, row + deltaRow));
    col = Math.min(puzzle.size.cols - 1, Math.max(0, col + deltaCol));
    if (puzzle.cells[row][col] !== null) return { row, col };
  }
  return current;
}

function findClueForCell(puzzle: Puzzle, cell: Position, direction: Direction) {
  return puzzle.clues[direction].find((clue) => cellsForClue(clue, direction).some((clueCell) => sameCell(clueCell, cell)));
}

function cellsForClue(clue: Clue, direction: Direction) {
  return clue.answer.split("").map((_, index) => ({
    row: clue.row + (direction === "down" ? index : 0),
    col: clue.col + (direction === "across" ? index : 0),
  }));
}

function otherDirection(direction: Direction): Direction {
  return direction === "across" ? "down" : "across";
}

function resolveDirectionForCell(puzzle: Puzzle, cell: Position, preferred: Direction): Direction {
  if (findClueForCell(puzzle, cell, preferred)) return preferred;
  const fallback = otherDirection(preferred);
  return findClueForCell(puzzle, cell, fallback) ? fallback : preferred;
}
