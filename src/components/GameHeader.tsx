import { formatTime } from "../utils/date";

type Props = {
  title: string;
  date: string;
  elapsed: number;
  onStats: () => void;
};

export function GameHeader({ title, date, elapsed, onStats }: Props) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">Crossed basketball crossword</p>
        <h1>{title}</h1>
        <span>{date}</span>
      </div>
      <div className="header-actions">
        <span className="timer" aria-label={`Timer ${formatTime(elapsed)}`}>
          {formatTime(elapsed)}
        </span>
        <button type="button" onClick={onStats}>
          Stats
        </button>
      </div>
    </header>
  );
}
