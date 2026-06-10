import type { CSSProperties } from "react";
import type { Puzzle } from "../puzzles/schema";
import { CrosswordCell } from "./CrosswordCell";

type Props = {
  puzzle: Puzzle;
  entries: (string | null)[][];
  selected: { row: number; col: number };
  activeCells: { row: number; col: number }[];
  revealed: Set<string>;
  incorrect: Set<string>;
  onSelect: (row: number, col: number) => void;
};

export function PuzzleGrid({ puzzle, entries, selected, activeCells, revealed, incorrect, onSelect }: Props) {
  const clueNumbers = new Map<string, number>();
  [...puzzle.clues.across, ...puzzle.clues.down].forEach((clue) => {
    clueNumbers.set(`${clue.row}-${clue.col}`, clue.number);
  });
  const largestDimension = Math.max(puzzle.size.rows, puzzle.size.cols);
  const cellFontMax = Math.min(5.1, Math.max(1.05, 21 / largestDimension));
  const cellFontPreferred = Math.min(9, Math.max(1.55, 54 / largestDimension));
  const numberFontMax = Math.min(0.95, Math.max(0.46, 7.2 / largestDimension));
  const gridStyle = {
    gridTemplateColumns: `repeat(${puzzle.size.cols}, minmax(0, 1fr))`,
    "--cell-font-size": `clamp(0.72rem, ${cellFontPreferred.toFixed(2)}vw, ${cellFontMax.toFixed(2)}rem)`,
    "--cell-number-size": `clamp(0.42rem, ${(cellFontPreferred * 0.42).toFixed(2)}vw, ${numberFontMax.toFixed(2)}rem)`,
  } as CSSProperties;

  return (
    <div
      className="puzzle-grid"
      style={gridStyle}
      aria-label={`${puzzle.size.rows} by ${puzzle.size.cols} crossword grid`}
    >
      {puzzle.cells.map((row, rowIndex) =>
        row.map((solution, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          return (
            <CrosswordCell
              key={key}
              row={rowIndex}
              col={colIndex}
              number={clueNumbers.get(key)}
              value={entries[rowIndex][colIndex]}
              solution={solution}
              selected={selected.row === rowIndex && selected.col === colIndex}
              active={activeCells.some((cell) => cell.row === rowIndex && cell.col === colIndex)}
              revealed={revealed.has(key)}
              incorrect={incorrect.has(key)}
              onSelect={() => onSelect(rowIndex, colIndex)}
            />
          );
        }),
      )}
    </div>
  );
}
