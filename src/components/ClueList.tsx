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
        <section className="clue-card" key={listDirection}>
          <div className="clue-card-header">
            <span className={`clue-card-icon ${listDirection}`} aria-hidden="true" />
            <h2>{listDirection}</h2>
          </div>
          {puzzle.clues[listDirection].map((clue) => (
            <button
              type="button"
              key={`${listDirection}-${clue.number}`}
              className={`clue ${activeClue?.number === clue.number && direction === listDirection ? "current" : ""}`}
              onClick={() => onSelect(clue, listDirection)}
            >
              <strong className="clue-number">{clue.number}</strong>
              <span className="clue-content">
                {clue.prompt.text && <span>{clue.prompt.text}</span>}
                {clue.prompt.imageCredit && <small>{clue.prompt.imageCredit}</small>}
              </span>
              {clue.prompt.imageSrc && <img className="clue-thumbnail" src={clue.prompt.imageSrc} alt={clue.prompt.imageAlt} loading="lazy" />}
              <span className="clue-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
