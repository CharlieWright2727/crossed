import { formatTime } from "../utils/date";

type Props = {
  elapsed: number;
  streak: number;
  onStats: () => void;
};

export function GameHeader({ elapsed, streak, onStats }: Props) {
  return (
    <header className="game-header">
      <div className="brand-cluster">
        <div className="brand-copy">
          <strong>CROSSED</strong>
          <span>BASKETBALL CROSSWORD</span>
        </div>
        <span className="header-divider" aria-hidden="true" />
        <span className="streak-pill" aria-label={`${streak} day streak`}>
          <span className="streak-mark" aria-hidden="true" /> {streak} DAY STREAK
        </span>
      </div>
      <div className="header-actions">
        <span className="timer" aria-label={`Timer ${formatTime(elapsed)}`}>
          <span aria-hidden="true">⏱</span> {formatTime(elapsed)}
        </span>
        <button type="button" className="stats-pill" onClick={onStats}>
          <span aria-hidden="true">▦</span> Stats
        </button>
      </div>
    </header>
  );
}
