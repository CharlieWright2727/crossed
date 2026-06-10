import { useEffect, useMemo, useState } from "react";
import { ArchiveList } from "./components/ArchiveList";
import { ClueList } from "./components/ClueList";
import { CompletionModal } from "./components/CompletionModal";
import { GameHeader } from "./components/GameHeader";
import { OnScreenKeyboard } from "./components/OnScreenKeyboard";
import { PrivacyNote } from "./components/PrivacyNote";
import { PuzzleGrid } from "./components/PuzzleGrid";
import { StatsModal } from "./components/StatsModal";
import { useCrosswordGame } from "./hooks/useCrosswordGame";
import { getMostRecentPuzzle, getPuzzleForDate, puzzles } from "./puzzles";
import { localDateId } from "./utils/date";

function formatPuzzleDate(dateId: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(`${dateId}T12:00:00`),
  );
}

function App() {
  const today = localDateId();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showStats, setShowStats] = useState(false);
  const [showComplete, setShowComplete] = useState(true);
  const puzzle = useMemo(() => getPuzzleForDate(selectedDate) ?? getMostRecentPuzzle(selectedDate), [selectedDate]);
  const game = useCrosswordGame(puzzle ?? puzzles[0]);

  useEffect(() => {
    setShowComplete(true);
  }, [puzzle?.date]);

  if (!puzzle) {
    return (
      <main className="app-shell empty-state">
        <h1>No puzzle available today</h1>
        <p>Check back soon for the next daily basketball crossword.</p>
        <PrivacyNote />
      </main>
    );
  }

  const isArchive = puzzle.date !== today;

  return (
    <main className="app-shell">
      <div className="background-dots" aria-hidden="true" />
      <div className="left-motion" aria-hidden="true">
        <span />
        <span />
      </div>
      <GameHeader elapsed={game.elapsed} streak={game.stats.currentStreak} onStats={() => setShowStats(true)} />
      <section className="title-block">
        <h1>{puzzle.title}<span className="title-mark" aria-hidden="true" /></h1>
        <p><span className="date-mark" aria-hidden="true" />{formatPuzzleDate(puzzle.date)}</p>
      </section>
      {isArchive && <p className="archive-banner">No puzzle is available for today, so you are playing the latest archive puzzle.</p>}
      <section className="game-board">
        <div className="play-area">
          <section className="grid-card" aria-label="Crossword puzzle">
            <PuzzleGrid
              puzzle={puzzle}
              entries={game.entries}
              selected={game.selected}
              activeCells={game.activeCells}
              revealed={game.revealed}
              incorrect={game.incorrect}
              onSelect={game.selectCell}
            />
          </section>
          <div className="toolbar" aria-label="Puzzle actions">
            <button type="button" className="primary-action" onClick={game.checkPuzzle}><span aria-hidden="true">✓</span> Check Puzzle</button>
            <button type="button" onClick={game.revealCell}><span aria-hidden="true">⌕</span> Reveal Cell</button>
            <button type="button" onClick={game.revealWord}><span aria-hidden="true">▣</span> Reveal Word</button>
            <button type="button" onClick={game.reset}><span aria-hidden="true">↻</span> Reset</button>
          </div>
          <OnScreenKeyboard onLetter={game.enterLetter} onBackspace={game.backspace} />
        </div>
        <aside className="side-panel">
          <ClueList puzzle={puzzle} activeClue={game.activeClue} direction={game.direction} onSelect={game.selectClue} />
          <ArchiveList puzzles={puzzles} activeDate={puzzle.date} onSelect={setSelectedDate} />
        </aside>
      </section>
      <PrivacyNote />
      {showStats && <StatsModal stats={game.stats} onClose={() => setShowStats(false)} />}
      {game.complete && showComplete && (
        <CompletionModal
          puzzle={puzzle}
          elapsed={game.elapsed}
          assisted={game.assisted}
          stats={game.stats}
          onClose={() => setShowComplete(false)}
        />
      )}
    </main>
  );
}

export default App;
