import { useMemo, useState } from "react";
import "./App.css";

type BingoNumber = {
  value: number;
  called: boolean;
};

const MIN_NUMBER = 1;
const MAX_NUMBER = 75;

function createInitialNumbers(): BingoNumber[] {
  return Array.from({ length: MAX_NUMBER - MIN_NUMBER + 1 }, (_, i) => ({
    value: MIN_NUMBER + i,
    called: false,
  }));
}

function App() {
  const [numbers, setNumbers] = useState<BingoNumber[]>(() =>
    createInitialNumbers()
  );
  const [lastCalled, setLastCalled] = useState<BingoNumber | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const remainingNumbers = useMemo(
    () => numbers.filter((n) => !n.called),
    [numbers]
  );

  const calledNumbers = useMemo(
    () => numbers.filter((n) => n.called),
    [numbers]
  );

  function handleStartNewGame() {
    setNumbers(createInitialNumbers());
    setLastCalled(null);
    setIsStarted(true);
  }

  function handleCallNext() {
    if (!isStarted || remainingNumbers.length === 0) return;

    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    const next = remainingNumbers[randomIndex];

    setNumbers((prev) =>
      prev.map((n) =>
        n.value === next.value
          ? {
              ...n,
              called: true,
            }
          : n
      )
    );
    setLastCalled(next);
  }

  function handleReset() {
    setNumbers(createInitialNumbers());
    setLastCalled(null);
    setIsStarted(false);
  }

  return (
    <div className="bingo-root">
      <header className="bingo-header">
        <h1 className="bingo-title">Bingo Host</h1>
        <p className="bingo-subtitle">
          Large-screen friendly control panel for live games
        </p>
      </header>

      <main className="bingo-layout">
        <section className="bingo-main-panel">
          <div className="bingo-now-label">Now calling</div>
          <div className="bingo-now-number">
            {lastCalled ? (
              <>
                <span className="bingo-now-letter">
                  {getBingoLetter(lastCalled.value)}
                </span>
                <span className="bingo-now-value">{lastCalled.value}</span>
              </>
            ) : (
              <span className="bingo-now-placeholder">
                {isStarted ? "Press NEXT to begin" : "Start a new game"}
              </span>
            )}
          </div>

          <div className="bingo-controls">
            <button
              type="button"
              className="bingo-button primary"
              onClick={handleCallNext}
              disabled={!isStarted || remainingNumbers.length === 0}
            >
              Next Number
            </button>
            <button
              type="button"
              className="bingo-button secondary"
              onClick={handleStartNewGame}
            >
              Start New Game
            </button>
            <button
              type="button"
              className="bingo-button subtle"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          <div className="bingo-status">
            <span>
              Called:{" "}
              <strong>
                {calledNumbers.length}/{numbers.length}
              </strong>
            </span>
            <span>
              Remaining: <strong>{remainingNumbers.length}</strong>
            </span>
          </div>
        </section>

        <section className="bingo-sidebar">
          <div className="bingo-grid-wrapper">
            <h2 className="bingo-section-title">Board</h2>
            <div className="bingo-grid">
              {numbers.map((n) => (
                <div
                  key={n.value}
                  className={`bingo-cell ${n.called ? "called" : ""}`}
                >
                  <span className="bingo-cell-letter">
                    {getBingoLetter(n.value)}
                  </span>
                  <span className="bingo-cell-value">{n.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bingo-history-wrapper">
            <h2 className="bingo-section-title">Call History</h2>
            <div className="bingo-history">
              {calledNumbers.length === 0 ? (
                <p className="bingo-history-empty">No numbers called yet.</p>
              ) : (
                [...calledNumbers]
                  .reverse()
                  .slice(0, 50)
                  .map((n) => (
                    <div key={n.value} className="bingo-history-item">
                      <span className="bingo-history-letter">
                        {getBingoLetter(n.value)}
                      </span>
                      <span className="bingo-history-value">{n.value}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function getBingoLetter(value: number): string {
  if (value >= 1 && value <= 15) return "B";
  if (value >= 16 && value <= 30) return "I";
  if (value >= 31 && value <= 45) return "N";
  if (value >= 46 && value <= 60) return "G";
  if (value >= 61 && value <= 75) return "O";
  return "";
}

export default App;
