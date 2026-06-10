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

  return (
    <div
      className="puzzle-grid"
      style={{ gridTemplateColumns: `repeat(${puzzle.size.cols}, minmax(0, 1fr))` }}
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
