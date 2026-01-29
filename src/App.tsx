import { useMemo, useState } from "react";
import "./App.css";

type BingoNumber = {
  value: number;
  called: boolean;
};

type BingoColumnKey = "B" | "I" | "N" | "G" | "O";

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
  const [callHistory, setCallHistory] = useState<number[]>([]);

  const remainingNumbers = useMemo(
    () => numbers.filter((n) => !n.called),
    [numbers]
  );

  const calledNumbers = useMemo(
    () => numbers.filter((n) => n.called),
    [numbers]
  );

  const lastCalledValue = callHistory[callHistory.length - 1];
  const lastCalled =
    lastCalledValue != null
      ? numbers.find((n) => n.value === lastCalledValue) ?? null
      : null;

  const groupedNumbers = useMemo(() => {
    const groups: Record<BingoColumnKey, BingoNumber[]> = {
      B: [],
      I: [],
      N: [],
      G: [],
      O: [],
    };

    numbers.forEach((n) => {
      const letter = getBingoLetter(n.value) as BingoColumnKey;
      if (letter) {
        groups[letter].push(n);
      }
    });

    return groups;
  }, [numbers]);

  const callHistoryNumbers = useMemo(
    () =>
      callHistory
        .map((value) => numbers.find((n) => n.value === value))
        .filter((n): n is BingoNumber => Boolean(n)),
    [callHistory, numbers]
  );

  function handleStartNewGame() {
    setNumbers(createInitialNumbers());
    setCallHistory([]);
  }

  function handleDrawNumber() {
    if (remainingNumbers.length === 0) return;

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
    setCallHistory((prev) => [...prev, next.value]);
  }

  function handleUndoLastCall() {
    if (callHistory.length === 0) return;

    const lastValue = callHistory[callHistory.length - 1];

    setCallHistory((prev) => prev.slice(0, -1));
    setNumbers((prev) =>
      prev.map((n) =>
        n.value === lastValue
          ? {
              ...n,
              called: false,
            }
          : n
      )
    );
  }

  function handleReset() {
    setNumbers(createInitialNumbers());
    setCallHistory([]);
  }

  return (
    <div className="bingo-root">
      <header className="bingo-header">
        <h1 className="bingo-title">BINGO HOST</h1>
        <p className="bingo-subtitle">
          Large-screen friendly control panel for live games
        </p>
      </header>

      <main className="bingo-layout">
        <section className="bingo-board-panel">
          <div className="bingo-grid-wrapper">
            <h2 className="bingo-section-title">Number Board</h2>
            <div className="bingo-grid">
              {(["B", "I", "N", "G", "O"] as BingoColumnKey[]).map(
                (columnKey) => (
                  <div key={columnKey} className="bingo-column">
                    <div className="bingo-column-header">{columnKey}</div>
                    {groupedNumbers[columnKey].map((n) => (
                      <div
                        key={n.value}
                        className={`bingo-cell ${n.called ? "called" : ""}`}
                      >
                        <span className="bingo-cell-value">{n.value}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bingo-history-wrapper">
            <h2 className="bingo-section-title">Call History</h2>
            <div className="bingo-history">
              {callHistoryNumbers.length === 0 ? (
                <p className="bingo-history-empty">No numbers called yet.</p>
              ) : (
                [...callHistoryNumbers]
                  .reverse()
                  .slice(0, 50)
                  .map((n) => (
                    <div key={n.value} className="bingo-history-item">
                      <span className="bingo-history-code">
                        {getBingoLetter(n.value)}-{n.value}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        <section className="bingo-control-panel">
          <div className="bingo-now-label">Current Call</div>
          <div className="bingo-now-number">
            {lastCalled ? (
              <>
                <span className="bingo-now-letter">
                  {getBingoLetter(lastCalled.value)}
                </span>
                <span className="bingo-now-value">{lastCalled.value}</span>
                <span className="bingo-now-code">
                  {getBingoLetter(lastCalled.value)}-{lastCalled.value}
                </span>
              </>
            ) : (
              <span className="bingo-now-placeholder">
                Press DRAW NUMBER to begin
              </span>
            )}
          </div>

          <div className="bingo-controls">
            <button
              type="button"
              className="bingo-button primary"
              onClick={handleDrawNumber}
              disabled={remainingNumbers.length === 0}
            >
              Draw Number
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
            <button
              type="button"
              className="bingo-button secondary"
              onClick={handleUndoLastCall}
              disabled={callHistory.length === 0}
            >
              Undo Last Call
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

          <div className="bingo-pattern-wrapper">
            <h2 className="bingo-section-title">Pattern</h2>
            <div className="bingo-pattern">
              <div className="bingo-pattern-name">Standard Line</div>
              <div className="bingo-pattern-description">
                Any full horizontal, vertical, or diagonal line.
              </div>
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
