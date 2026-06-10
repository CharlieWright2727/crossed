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
    setEntries(makeEmptyGrid(puzzle));
    setSelected(firstOpenCell(puzzle));
    setDirection("across");
    setRevealed(new Set());
    setIncorrect(new Set());
    setComplete(false);
    setStartedAt(Date.now());
    setElapsed(0);
  }, [puzzle]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

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
        setComplete(true);
        setStats(saveCompletion(puzzle.date, elapsed));
      }
    },
    [complete, elapsed, entries, isSolved, puzzle.date],
  );

  const move = useCallback(
    (deltaRow: number, deltaCol: number) => {
      setSelected((current) => nextOpenCell(puzzle, current, deltaRow, deltaCol));
    },
    [puzzle],
  );

  const enterLetter = useCallback(
    (letter: string) => {
      setEntries((current) => {
        const next = current.map((row) => [...row]);
        next[selected.row][selected.col] = letter.toUpperCase();
        window.setTimeout(() => finishIfSolved(next), 0);
        return next;
      });
      move(direction === "down" ? 1 : 0, direction === "across" ? 1 : 0);
    },
    [direction, finishIfSolved, move, selected],
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
  }, [puzzle]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (/^[a-z]$/i.test(event.key)) enterLetter(event.key);
      if (event.key === "Backspace") backspace();
      if (event.key === "ArrowUp") move(-1, 0);
      if (event.key === "ArrowDown") move(1, 0);
      if (event.key === "ArrowLeft") move(0, -1);
      if (event.key === "ArrowRight") move(0, 1);
      if (event.key === " " || event.key === "Enter") setDirection((value) => (value === "across" ? "down" : "across"));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [backspace, enterLetter, move]);

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
    setSelected,
    setDirection,
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
