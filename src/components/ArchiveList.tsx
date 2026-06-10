import type { Puzzle } from "../puzzles/schema";

type Props = {
  puzzles: Puzzle[];
  activeDate: string;
  onSelect: (date: string) => void;
};

export function ArchiveList({ puzzles, activeDate, onSelect }: Props) {
  return (
    <section className="archive">
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
