import type { Clue, Direction, Puzzle } from "../puzzles/schema";

type Props = {
  puzzle: Puzzle;
  activeClue?: Clue;
  direction: Direction;
  onSelect: (clue: Clue, direction: Direction) => void;
  onImageOpen: (image: { src: string; alt: string; credit?: string }) => void;
};

export function ClueList({ puzzle, activeClue, direction, onSelect, onImageOpen }: Props) {
  return (
    <aside className="clues" aria-label="Crossword clues">
      {(["across", "down"] as Direction[]).map((listDirection) => (
        <section className="clue-card" key={listDirection}>
          <div className="clue-card-header">
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
              {clue.prompt.imageSrc && (
                <img
                  className="clue-thumbnail"
                  src={clue.prompt.imageSrc}
                  alt={clue.prompt.imageAlt}
                  loading="lazy"
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onImageOpen({
                      src: clue.prompt.imageSrc!,
                      alt: clue.prompt.imageAlt ?? "",
                      credit: clue.prompt.imageCredit,
                    });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onImageOpen({
                        src: clue.prompt.imageSrc!,
                        alt: clue.prompt.imageAlt ?? "",
                        credit: clue.prompt.imageCredit,
                      });
                    }
                  }}
                />
              )}
              <span className="clue-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
