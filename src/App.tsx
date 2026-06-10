import { useMemo, useState } from "react";
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

function App() {
  const today = localDateId();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showStats, setShowStats] = useState(false);
  const [showComplete, setShowComplete] = useState(true);
  const puzzle = useMemo(() => getPuzzleForDate(selectedDate) ?? getMostRecentPuzzle(selectedDate), [selectedDate]);
  const game = useCrosswordGame(puzzle ?? puzzles[0]);

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
      <GameHeader title={puzzle.title} date={puzzle.date} elapsed={game.elapsed} onStats={() => setShowStats(true)} />
      {isArchive && <p className="archive-banner">No puzzle is available for today, so you are playing the latest archive puzzle.</p>}
      <section className="game-board">
        <div className="play-area">
          <PuzzleGrid
            puzzle={puzzle}
            entries={game.entries}
            selected={game.selected}
            activeCells={game.activeCells}
            revealed={game.revealed}
            incorrect={game.incorrect}
            onSelect={(row, col) => game.setSelected({ row, col })}
          />
          <div className="toolbar" aria-label="Puzzle actions">
            <button type="button" onClick={game.checkPuzzle}>Check puzzle</button>
            <button type="button" onClick={game.revealCell}>Reveal cell</button>
            <button type="button" onClick={game.revealWord}>Reveal word</button>
            <button type="button" onClick={game.reset}>Reset</button>
          </div>
          <OnScreenKeyboard onLetter={game.enterLetter} onBackspace={game.backspace} />
        </div>
        <ClueList puzzle={puzzle} activeClue={game.activeClue} direction={game.direction} onSelect={game.selectClue} />
      </section>
      <ArchiveList puzzles={puzzles} activeDate={puzzle.date} onSelect={setSelectedDate} />
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
