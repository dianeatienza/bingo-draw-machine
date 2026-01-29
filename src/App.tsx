import { useMemo, useState } from "react";
import "./App.css";

type BingoNumber = {
  value: number;
  called: boolean;
};

type BingoColumnKey = "B" | "I" | "N" | "G" | "O";

type PatternGrid = boolean[][];

const MIN_NUMBER = 1;
const MAX_NUMBER = 75;
const PATTERN_SIZE = 5;

function createInitialNumbers(): BingoNumber[] {
  return Array.from({ length: MAX_NUMBER - MIN_NUMBER + 1 }, (_, i) => ({
    value: MIN_NUMBER + i,
    called: false,
  }));
}

function createEmptyPattern(): PatternGrid {
  return Array.from({ length: PATTERN_SIZE }, () =>
    Array.from({ length: PATTERN_SIZE }, () => false)
  );
}

function App() {
  const [numbers, setNumbers] = useState<BingoNumber[]>(() =>
    createInitialNumbers()
  );
  const [callHistory, setCallHistory] = useState<number[]>([]);
  const [pattern, setPattern] = useState<PatternGrid>(() =>
    createEmptyPattern()
  );
  const [isPatternEnlarged, setIsPatternEnlarged] = useState(false);

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
    setPattern(createEmptyPattern());
  }

  function handleTogglePatternCell(row: number, col: number) {
    setPattern((prev) =>
      prev.map((rowValues, rowIndex) =>
        rowIndex === row
          ? rowValues.map((cellValue, colIndex) =>
              colIndex === col ? !cellValue : cellValue
            )
          : rowValues
      )
    );
  }

  function handleClearPattern() {
    setPattern(createEmptyPattern());
  }

  function handleTogglePatternSize() {
    setIsPatternEnlarged((prev) => !prev);
  }

  return (
    <div className="bingo-root">
      <header className="bingo-header">
        <h1 className="bingo-title">AO Family Bingo</h1>
        {/* <p className="bingo-subtitle">
          Large-screen friendly control panel for live games
        </p> */}
      </header>

      <main className="bingo-layout">
        <section className="bingo-board-panel">
          <div className="bingo-grid-wrapper">
            {/* <h2 className="bingo-section-title">Number Board</h2> */}
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
                callHistoryNumbers
                  .slice(-50)
                  .reverse()
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
          {/* <div className="bingo-section-title">Current Call</div> */}
          <div className="bingo-now-number">
            {lastCalled ? (
              <>
                <span className="bingo-now-letter">
                  {getBingoLetter(lastCalled.value)}
                </span>
                <span className="bingo-now-value">{lastCalled.value}</span>
                {/* <span className="bingo-now-code">
                  {getBingoLetter(lastCalled.value)}-{lastCalled.value}
                </span> */}
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
              className="bingo-button subtle"
              onClick={handleReset}
            >
              New Game
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
            <h2 className="bingo-section-title">Winning Pattern</h2>
            <div className="bingo-pattern">
              <div className="bingo-pattern-header-row">
                <div className="bingo-pattern-text">
                  {/* <div className="bingo-pattern-name">Winning Pattern</div> */}
                  <div className="bingo-pattern-description">
                    Click cells to toggle the active winning pattern.
                  </div>
                </div>
                <div className="bingo-pattern-actions">
                  <button
                    type="button"
                    className="bingo-pattern-action-button"
                    onClick={handleClearPattern}
                  >
                    Clear Pattern
                  </button>
                  <button
                    type="button"
                    className="bingo-pattern-action-button"
                    onClick={handleTogglePatternSize}
                  >
                    {isPatternEnlarged ? "Shrink Pattern" : "Enlarge Pattern"}
                  </button>
                </div>
              </div>

              <div className="bingo-pattern-grid">
                {pattern.map((row, rowIndex) => (
                  <div key={rowIndex} className="bingo-pattern-row">
                    {row.map((isActive, colIndex) => (
                      <button
                        key={colIndex}
                        type="button"
                        className={`bingo-pattern-cell ${
                          isActive ? "active" : ""
                        }`}
                        onClick={() =>
                          handleTogglePatternCell(rowIndex, colIndex)
                        }
                      >
                        &nbsp;
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {isPatternEnlarged && (
        <div
          className="bingo-pattern-overlay"
          onClick={handleTogglePatternSize}
        >
          <div
            className="bingo-pattern-overlay-inner"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bingo-pattern-overlay-title">Winning Pattern</div>
            <div className="bingo-pattern-overlay-grid">
              {pattern.map((row, rowIndex) => (
                <div key={rowIndex} className="bingo-pattern-row">
                  {row.map((isActive, colIndex) => (
                    <button
                      key={colIndex}
                      type="button"
                      className={`bingo-pattern-cell ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() =>
                        handleTogglePatternCell(rowIndex, colIndex)
                      }
                    >
                      &nbsp;
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <p className="bingo-pattern-overlay-hint">
              Click cells to edit the pattern. Click outside this box to close.
            </p>
          </div>
        </div>
      )}
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
