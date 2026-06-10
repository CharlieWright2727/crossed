import { formatTime } from "../utils/date";
import type { LocalStats } from "../hooks/useLocalStats";
import type { Puzzle } from "../puzzles/schema";

type Props = {
  puzzle: Puzzle;
  elapsed: number;
  assisted: boolean;
  stats: LocalStats;
  onClose: () => void;
};

export function CompletionModal({ puzzle, elapsed, assisted, stats, onClose }: Props) {
  const shareText = `NBA Crossword #${puzzle.id}
Solved in ${formatTime(elapsed)}
Streak: ${stats.currentStreak}
${puzzle.size.rows}x${puzzle.size.cols} Mini
${assisted ? "Reveals used" : "No reveals"}`;

  async function share() {
    if (navigator.share) {
      await navigator.share({ text: shareText });
      return;
    }
    await navigator.clipboard.writeText(shareText);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal complete-modal" role="dialog" aria-modal="true" aria-labelledby="complete-title">
        <p className="eyebrow">Puzzle complete</p>
        <h2 id="complete-title">Solved in {formatTime(elapsed)}</h2>
        <div className="stat-grid">
          <span><strong>{stats.currentStreak}</strong> Current streak</span>
          <span><strong>{stats.maxStreak}</strong> Max streak</span>
          <span><strong>{stats.gamesPlayed}</strong> Games played</span>
          <span><strong>{assisted ? "Assisted" : "Clean"}</strong> Result</span>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={share}>Share result</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}
