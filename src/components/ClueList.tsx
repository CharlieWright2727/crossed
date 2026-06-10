import type { Clue, Direction, Puzzle } from "../puzzles/schema";

type Props = {
  puzzle: Puzzle;
  activeClue?: Clue;
  direction: Direction;
  onSelect: (clue: Clue, direction: Direction) => void;
};

export function ClueList({ puzzle, activeClue, direction, onSelect }: Props) {
  return (
    <aside className="clues" aria-label="Crossword clues">
      {(["across", "down"] as Direction[]).map((listDirection) => (
        <section key={listDirection}>
          <h2>{listDirection}</h2>
          {puzzle.clues[listDirection].map((clue) => (
            <button
              type="button"
              key={`${listDirection}-${clue.number}`}
              className={`clue ${activeClue?.number === clue.number && direction === listDirection ? "current" : ""}`}
              onClick={() => onSelect(clue, listDirection)}
            >
              <strong>{clue.number}</strong>
              <span>{clue.clue}</span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
