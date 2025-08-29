import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ANSWER = "7662" as const;
const CODE_LENGTH = 4;
export const STORAGE_KEY = "number-game-v1" as const;

const KEY_ROWS: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["ENTER", "0", "⌫"],
];

const CLUES = [
  "One of us is an odd number but take a letter away and we're all even.",
  "In time, 9 plus 5 makes the smallest of us.",
  "We start at the summit and end at the floor.",
  "All together we are twenty-one.",
];

type Status = "playing" | "won" | "wrong";

function sanitizeInput(input: string) {
  return input.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export default function NumberGame() {
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<Status>("playing");
  const [hydrated, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // --- Load from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { version: number; current: string; status: Status } | null;
        if (data && data.version === 2) {
          if (typeof data.current === "string") setCurrent(sanitizeInput(data.current));
          if (data.status === "playing" || data.status === "won" || data.status === "wrong") setStatus(data.status);
        }
      }
    } catch {}
    finally {
      setHydrated(true);
    }
  }, []);

  // --- Save to localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !hydrated) return;
      const payload = { version: 2, current, status, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [current, status, hydrated]);

  const submitGuess = useCallback(() => {
    if (status === "won") return;
    if (current.length !== CODE_LENGTH) return;
    if (current === ANSWER) {
      setStatus("won");
    } else {
      setStatus("wrong");
    }
    boardRef.current?.focus();
  }, [current, status]);

  const handleBackspace = useCallback(() => {
    if (status === "won") return;
    setCurrent(prev => prev.slice(0, -1));
    if (status === "wrong") setStatus("playing");
  }, [status]);

  const handleAddDigit = useCallback((d: string) => {
    if (status === "won") return;
    setCurrent(prev => (prev.length < CODE_LENGTH ? sanitizeInput(prev + d) : prev));
    if (status === "wrong") setStatus("playing");
  }, [status]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (/^\d$/.test(key)) {
        e.preventDefault();
        handleAddDigit(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitGuess, handleBackspace, handleAddDigit]);

  const reset = () => {
    setCurrent("");
    setStatus("playing");
    try { if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY); } catch {}
    boardRef.current?.focus();
  };

  const wrongFlash = status === "wrong";

  const message = useMemo(() => {
    if (status === "won") {
      return (<>
        <p>🎉 Congratulations! <br />The lockbox is now unlocked! Proceed to <strong className="bg-green-600 text-white p-1 rounded-md">DANCERS' ALLEY</strong> to do the activity!</p>
      </>)
    }
      return null;
  }, [status]);

  return (
    <div className="w-full text-gray-900 flex flex-col items-center">
      <style>{`
        @keyframes shake { 
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* Clues */}
        <ul className="list-disc ml-4 space-y-1 text-sm mb-5">
            {CLUES.map((c, i) => (
                <li key={i}>{c}</li>
            ))}
        </ul>

        {/* Single row board */}
        <div
          ref={boardRef}
          tabIndex={0}
          className={[
            "outline-none select-none mb-6 grid grid-cols-4 gap-2",
            wrongFlash ? "[animation:shake_0.35s_ease-in-out_0s_1]" : "",
          ].join(" ")}
          aria-label="Number lock board"
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const ch = current[i] ?? "";
            return (
              <div
                key={i}
                className={[
                  "aspect-square rounded-xl border text-center inline-flex items-center justify-center font-bold text-xl transition-colors duration-200",
                  status === "won"
                    ? "bg-green-600 text-white border-green-600"
                    : wrongFlash
                    ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-300"
                    : "border-gray-400",
                ].join(" ")}
              >
                {ch}
              </div>
            );
          })}
        </div>

        {message && <div className="my-5 text-center">{message}</div>}

        {/* On-screen keyboard */}
        {
            status !== 'won' && <div className="flex flex-col items-center gap-2">
                {KEY_ROWS.map((row, idx) => (
                    <div key={idx} className="flex gap-1">
                    {row.map((label) => {
                        const isAction = label === "ENTER" || label === "⌫";
                        return (
                        <button
                            key={label}
                            onClick={() => {
                            if (label === "ENTER") submitGuess();
                            else if (label === "⌫") handleBackspace();
                            else handleAddDigit(label);
                            }}
                            className={[
                            "px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-150 shadow-sm min-w-[3rem]",
                            isAction ? "bg-gray-300 text-gray-800" : "bg-gray-200 text-gray-900 hover:bg-gray-300",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                        );
                    })}
                    </div>
                ))}
            </div>
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
              to="/"
              className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
            >
              Continue →
            </Link>
          }
        </footer>

        { status === 'won' && <p className="mt-3 text-xs text-center text-gray-500">Note: There is no physical lockbox, it's just this virtual one.</p>}
      </div>
    </div>
  );
}