import { bestCompletionTime, type LocalStats } from "../hooks/useLocalStats";
import { formatTime } from "../utils/date";

type Props = {
  stats: LocalStats;
  onClose: () => void;
};

export function StatsModal({ stats, onClose }: Props) {
  const bestTime = bestCompletionTime(stats);
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="stats-title">
        <h2 id="stats-title">Stats</h2>
        <div className="stat-grid">
          <span><strong>{stats.currentStreak}</strong> Current streak</span>
          <span><strong>{stats.maxStreak}</strong> Max streak</span>
          <span><strong>{stats.totalCompletions}</strong> Won</span>
          <span><strong>{bestTime ? formatTime(bestTime) : "--"}</strong> Best time</span>
        </div>
        <p className="note">Stats and streaks are stored only in this browser on this device.</p>
        <button type="button" onClick={onClose}>Close</button>
      </section>
    </div>
  );
}
