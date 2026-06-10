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
  const mobileCellSize = getMobileCellSize(largestDimension);
  const cellFontMax = Math.min(1.05, Math.max(0.68, 15 / largestDimension));
  const cellFontPreferred = Math.min(2.2, Math.max(1.15, 30 / largestDimension));
  const numberFontMax = Math.min(0.75, Math.max(0.34, 6.8 / largestDimension));
  const numberFontPreferred = Math.min(0.9, Math.max(0.48, 12 / largestDimension));
  const gridStyle = {
    "--grid-cols": puzzle.size.cols,
    "--grid-rows": puzzle.size.rows,
    "--mobile-grid-min-width": `${puzzle.size.cols * mobileCellSize}px`,
    "--mobile-grid-min-height": `${puzzle.size.rows * mobileCellSize}px`,
    gridTemplateColumns: `repeat(${puzzle.size.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${puzzle.size.rows}, minmax(0, 1fr))`,
    aspectRatio: `${puzzle.size.cols} / ${puzzle.size.rows}`,
    "--cell-font-size": `clamp(0.68rem, ${cellFontPreferred.toFixed(2)}vmin, ${cellFontMax.toFixed(2)}rem)`,
    "--cell-number-size": `clamp(0.28rem, ${numberFontPreferred.toFixed(2)}vmin, ${numberFontMax.toFixed(2)}rem)`,
  } as CSSProperties;

  return (
    <div
      className="puzzle-grid-scroll"
      aria-label="Crossword grid scroll area"
    >
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
    </div>
  );
}

function getMobileCellSize(largestDimension: number) {
  if (largestDimension <= 7) return 42;
  if (largestDimension <= 12) return 36;
  if (largestDimension <= 16) return 32;
  return 28;
}
