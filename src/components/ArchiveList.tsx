import type { Puzzle } from "../puzzles/schema";

type Props = {
  puzzles: Puzzle[];
  activeDate: string;
  onSelect: (date: string) => void;
};

export function ArchiveList({ puzzles, activeDate, onSelect }: Props) {
  return (
    <section className="archive">
      <div className="daily-tip">
        <span aria-hidden="true">🏟</span>
        <div>
          <strong>Daily tip-off. New puzzle every day.</strong>
          <p>Come back tomorrow to keep your streak alive.</p>
        </div>
        <button type="button" aria-label="Open archive dates">📅</button>
      </div>
      <h2>Archive</h2>
      <div>
        {puzzles.map((puzzle) => (
          <button
            type="button"
            key={puzzle.id}
            className={puzzle.date === activeDate ? "active-archive" : ""}
            onClick={() => onSelect(puzzle.date)}
          >
            {puzzle.date}
          </button>
        ))}
      </div>
    </section>
  );
}
