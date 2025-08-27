import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// --- Types

type CellState = "empty" | "tbd" | "correct" | "present" | "absent";

type Evaluation = {
  letters: string[]; // per-cell letter
  states: CellState[]; // per-cell state
};

// --- Constants

const ANSWER = "ALLEY";
const WORD_LENGTH = 5;
export const STORAGE_KEY = "word-game-v1" as const;

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

// Keyboard state per letter
interface KeyStateMap {
  [letter: string]: Exclude<CellState, "empty" | "tbd">; // correct | present | absent
}

// Utility to clamp string to letters only
function sanitizeGuess(input: string) {
  return input
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, WORD_LENGTH)
    .toUpperCase();
}

// Evaluate a guess against the answer with proper duplicate handling
function evaluateGuess(guessRaw: string, answerRaw: string): Evaluation {
  const guess = guessRaw.toUpperCase();
  const answer = answerRaw.toUpperCase();

  const letters = guess.split("");
  const states: CellState[] = Array(WORD_LENGTH).fill("tbd");

  // First pass: mark correct
  const remaining: Record<string, number> = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    const g = guess[i];
    const a = answer[i];
    if (g === a) {
      states[i] = "correct";
    } else {
      remaining[a] = (remaining[a] ?? 0) + 1;
    }
  }

  // Second pass: mark present/absent for non-correct cells
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (states[i] !== "tbd") continue;
    const g = guess[i];
    if (remaining[g] > 0) {
      states[i] = "present";
      remaining[g] -= 1;
    } else {
      states[i] = "absent";
    }
  }

  return { letters, states };
}

function classForState(state: CellState) {
  // Neutral tiles until submitted; then color
  switch (state) {
    case "correct":
      return "bg-green-600 text-white border-green-600";
    case "present":
      return "bg-yellow-500 text-white border-yellow-500";
    case "absent":
      return "bg-gray-400 text-white border-gray-400";
    case "tbd":
      return "border-gray-400 text-gray-900";
    default:
      return "border-gray-400";
  }
}

function keyClassForState(state?: KeyStateMap[string]) {
  switch (state) {
    case "correct":
      return "bg-green-600 text-white";
    case "present":
      return "bg-yellow-500 text-white";
    case "absent":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-200 text-gray-900";
  }
}

function mergeKeyState(prev: KeyStateMap, letter: string, next: KeyStateMap[string]): KeyStateMap {
  // Preserve strongest: correct > present > absent
  const strength: Record<string, number> = { absent: 0, present: 1, correct: 2 } as const;
  const current = prev[letter];
  if (!current || strength[next] > strength[current]) {
    return { ...prev, [letter]: next };
  }
  return prev;
}

export default function WordGame() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [keys, setKeys] = useState<KeyStateMap>({});
  const [status, setStatus] = useState<"playing" | "won">("playing");
  const boardRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  // --- Load from localStorage on first mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          version: number;
          guesses: string[];
          evaluations: Evaluation[];
          keys: KeyStateMap;
          status: "playing" | "won";
          current?: string;
        } | null;
        if (data && data.version === 1) {
          const validGuess = (g: string) => /^[A-Z]{5}$/.test(g);
          const validEval = (e: Evaluation) => Array.isArray(e.letters) && Array.isArray(e.states) && e.letters.length === WORD_LENGTH && e.states.length === WORD_LENGTH;

          if (Array.isArray(data.guesses) && data.guesses.every(validGuess)) setGuesses(data.guesses);
          if (Array.isArray(data.evaluations) && data.evaluations.every(validEval)) setEvaluations(data.evaluations);
          if (data.keys && typeof data.keys === "object") setKeys(data.keys);
          if (data.status === "playing" || data.status === "won") setStatus(data.status);
          if (typeof data.current === "string") setCurrent(sanitizeGuess(data.current));
        }
      }
    } catch {
      // ignore corrupted saves
    } finally {
      setHydrated(true);
    }
  }, []);

  // --- Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !hydrated) return; // don't overwrite before we hydrate
      const payload = {
        version: 1,
        guesses,
        evaluations,
        keys,
        status,
        current,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // storage may be unavailable
    }
  }, [guesses, evaluations, keys, status, current, hydrated]);

  // Rows only include: all submitted evaluations + (if typing) a single current row.
  const rows = useMemo(() => {
    const evalRows: Evaluation[] = [...evaluations];
    if (status === "playing") {
      const letters = (current.toUpperCase().padEnd(WORD_LENGTH, " ").slice(0, WORD_LENGTH)).split("");
      const states: CellState[] = Array(WORD_LENGTH)
        .fill("tbd")
        .map((_, i) => (letters[i] === " " ? "empty" : "tbd"));
      evalRows.push({ letters, states });
    }
    return evalRows; // typing row is always visible while playing
  }, [evaluations, current, status]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;
    const guess = sanitizeGuess(current);
    if (guess.length !== WORD_LENGTH) return; // ignore incomplete

    const evaluation = evaluateGuess(guess, ANSWER);

    setEvaluations(prev => [...prev, evaluation]);
    setGuesses(prev => [...prev, guess]);
    setCurrent("");

    // Update keyboard state
    setKeys(prev => {
      let next = { ...prev };
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = evaluation.letters[i];
        const state = evaluation.states[i];
        if (state === "correct" || state === "present" || state === "absent") {
          next = mergeKeyState(next, letter, state);
        }
      }
      return next;
    });

    const isWin = evaluation.states.every(s => s === "correct");
    if (isWin) setStatus("won");

    boardRef.current?.focus();
  }, [current, status]);

  const handleBackspace = useCallback(() => {
    if (status !== "playing") return;
    setCurrent(prev => prev.slice(0, -1));
  }, [status]);

  const handleAddLetter = useCallback((letter: string) => {
    if (status !== "playing") return;
    setCurrent(prev => (prev.length < WORD_LENGTH ? sanitizeGuess(prev + letter) : prev));
  }, [status]);

  // Physical keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (status !== "playing") return;
      const key = e.key;
      if (key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        handleAddLetter(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitGuess, handleBackspace, handleAddLetter, status]);

  const reset = () => {
    setGuesses([]);
    setCurrent("");
    setEvaluations([]);
    setKeys({});
    setStatus("playing");
    try {
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    } catch {}
    boardRef.current?.focus();
  };

  return (
    <div className="w-full text-gray-900 flex flex-col items-center">
      <div className="w-full">
        {/* Board */}
        <div
          ref={boardRef}
          tabIndex={0}
          className="outline-none select-none mb-6 grid gap-2"
          style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}
          aria-label="Wordle board"
        >
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-5 gap-2">
              {row.letters.map((ch, cIdx) => {
                const state = row.states[cIdx];
                const isFilled = ch !== " ";
                return (
                  <div
                    key={cIdx}
                    className={[
                      "aspect-square rounded-xl border text-center inline-flex items-center justify-center font-bold text-xl",
                      "transition-colors duration-200",
                      classForState(state),
                      !isFilled && state === "empty" ? "bg-transparent" : "",
                    ].join(" ")}
                    aria-label={`row ${rIdx + 1} col ${cIdx + 1}`}
                  >
                    {ch.trim()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {
          status === "won" 
            ? <div className="text-center">
                <p>🎉 Congratulations! <br />Your first location clue is <strong className="bg-green-600 text-white p-1 rounded-md">ALLEY</strong></p>
              </div>
            : <>
              {/* On-screen keyboard */}
              <div className="flex flex-col items-center gap-2 w-full">
                {KEY_ROWS.map((row, idx) => (
                  <div key={idx} className="flex gap-1 items-center justify-center w-full">
                    {row.map((keyLabel) => {
                      const isAction = keyLabel === "ENTER" || keyLabel === "⌫";
                      const state = !isAction ? keys[keyLabel] : undefined;
                      return (
                        <button
                          key={keyLabel}
                          onClick={() => {
                            if (keyLabel === "ENTER") submitGuess();
                            else if (keyLabel === "⌫") handleBackspace();
                            else handleAddLetter(keyLabel);
                          }}
                          className={[
                            "py-4 rounded-md text-xs font-semibold",
                            "transition-colors duration-150 shadow-sm flex-1",
                            keyLabel === "ENTER" ? "max-w-[3.5rem] min-w-13" : "max-w-12",
                            isAction ? "bg-gray-300 text-gray-900" : keyClassForState(state),
                          ].join(" ")}
                          aria-label={keyLabel === "⌫" ? "Backspace" : keyLabel}
                        >
                          {keyLabel}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
        }
        <footer className="flex justify-center mt-5 gap-5">
          <button
            onClick={reset}
            className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
            aria-label="Reset game"
          >
            ↺ Reset
          </button>
          {
            status === 'won' && <Link
              to="/location/2"
              className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
            >
              Continue →
            </Link>
          }
        </footer>
      </div>
    </div>
  );
}
