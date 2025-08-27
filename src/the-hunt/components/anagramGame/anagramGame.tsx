import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// --- Constants & Types
const ANSWER = "DANCERS" as const; // 7 letters
const LETTERS = ANSWER.split("");
export const STORAGE_KEY = "anagram-game-v1" as const;

// simple Fisher–Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// validate only letters we allow
function sanitizeLetter(k: string) {
  const up = k.toUpperCase();
  return /^[A-Z]$/.test(up) ? up : "";
}

type Status = "playing" | "won" | "wrong";

export default function AnagramGame() {
  // pool is the current shuffled keyboard letters
  const [pool, setPool] = useState<string[]>(() => shuffle(LETTERS));
  // used stores indices into pool that are selected (so duplicates handled if needed)
  const [used, setUsed] = useState<number[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [status, setStatus] = useState<Status>("playing");
  const [attempts, setAttempts] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // --- Hydrate from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          version: number;
          pool: string[];
          used: number[];
          current: string;
          status: Status;
          attempts: number;
        } | null;
        if (data && data.version === 1) {
          if (Array.isArray(data.pool) && data.pool.length === LETTERS.length) setPool(data.pool);
          if (Array.isArray(data.used)) setUsed(data.used.filter((n) => Number.isInteger(n)));
          if (typeof data.current === "string") setCurrent(data.current);
          if (data.status === "playing" || data.status === "won" || data.status === "wrong") setStatus(data.status);
          if (Number.isInteger(data.attempts)) setAttempts(data.attempts);
        }
      }
    } catch {}
    finally {
      setHydrated(true);
    }
  }, []);

  // --- Persist to localStorage after hydration
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !hydrated) return;
      const payload = { version: 1, pool, used, current, status, attempts, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [pool, used, current, status, attempts, hydrated]);

  const canSubmit = current.length === LETTERS.length;
  const isCorrect = useMemo(() => current.toUpperCase() === ANSWER, [current]);
  const wrongFlash = status === "wrong" && canSubmit; // for styling + shake

  const selectIndex = useCallback(
    (idx: number) => {
      if (status === "won") return; // lock on win; allow retries if wrong
      if (used.includes(idx)) return;
      if (current.length >= LETTERS.length) return;
      setUsed((u) => [...u, idx]);
      setCurrent((c) => c + pool[idx]);
    },
    [pool, used, current.length, status]
  );

  const backspace = useCallback(() => {
    if (current.length === 0) return;
    setUsed((u) => u.slice(0, -1));
    setCurrent((c) => c.slice(0, -1));
    if (status === "wrong") setStatus("playing");
  }, [current.length, status]);

  const clearSelection = useCallback(() => {
    setUsed([]);
    setCurrent("");
    if (status === "wrong") setStatus("playing");
  }, [status]);

  const submit = useCallback(() => {
    if (!canSubmit) return;
    setAttempts((n) => n + 1);
    if (isCorrect) {
      setStatus("won");
    } else {
      setStatus("wrong");
    }
    boardRef.current?.focus();
  }, [canSubmit, isCorrect]);

  const reset = useCallback(() => {
    setPool(shuffle(LETTERS));
    setUsed([]);
    setCurrent("");
    setStatus("playing");
    setAttempts(0);
    try { if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY); } catch {}
    boardRef.current?.focus();
  }, []);

  const reshuffle = useCallback(() => {
    setPool((p) => shuffle(p));
    setUsed([]);
    setCurrent("");
    if (status === "wrong") setStatus("playing");
  }, [status]);

  // Physical keyboard support (letters, Enter, Backspace)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (key === "Enter") {
        e.preventDefault();
        if (canSubmit) submit();
        return;
      }
      if (key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      const up = sanitizeLetter(key);
      if (!up) return;
      // find first unused matching letter in pool
      for (let i = 0; i < pool.length; i++) {
        if (!used.includes(i) && pool[i] === up) {
          e.preventDefault();
          selectIndex(i);
          break;
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pool, used, selectIndex, submit, canSubmit, backspace]);

  // Auto-check when all letters used (if user clicks last letter instead of Enter)
  useEffect(() => {
    if (current.length === LETTERS.length && status === "playing") {
      // small microtask to allow UI to paint the last letter
      const t = setTimeout(() => submit(), 0);
      return () => clearTimeout(t);
    }
  }, [current.length, status, submit]);

  const message = useMemo(() => {
    if (status === "won") return <p>🎉 Congratulations! <br />Your second location clue is <strong className="bg-green-600 text-white p-1 rounded-md">DANCERS'</strong></p>
    if (status === "wrong") return <p>❌ Try again</p>;
    return null;
  }, [status]);

  return (
    <div className="w-full text-gray-900 flex flex-col items-center">
      {/* Local keyframes for shake animation */}
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
        {/* Current guess tiles */}
        <div
          ref={boardRef}
          tabIndex={0}
          className={[
            "outline-none select-none mb-6 grid grid-cols-7 gap-2",
            wrongFlash ? "[animation:shake_0.35s_ease-in-out_0s_1]" : "",
          ].join(" ")}
          aria-label="Anagram board"
        >
          {Array.from({ length: LETTERS.length }).map((_, i) => (
            <div
              key={i}
              className={[
                "aspect-square rounded-xl border text-center inline-flex items-center justify-center font-bold text-xl",
                "transition-colors duration-200",
                status === "won"
                  ? "bg-green-600 text-white border-green-600"
                  : wrongFlash
                  ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-300"
                  : "border-gray-400",
              ].join(" ")}
              aria-label={`slot ${i + 1}`}
            >
              {current[i] ?? ""}
            </div>
          ))}
        </div>

        {/* Keyboard with shuffled letters */}
        {
          status !== 'won' && <div className="flex flex-wrap justify-center gap-2">
            {pool.map((ch, idx) => {
              const disabled = used.includes(idx);
              return (
                <button
                  key={`${ch}-${idx}`}
                  onClick={() => selectIndex(idx)}
                  disabled={disabled}
                  className={[
                    "px-4 py-2 rounded-md text-lg font-semibold",
                    "transition-colors duration-150 shadow-sm min-w-[3rem]",
                    disabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : wrongFlash
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300",
                  ].join(" ")}
                  aria-label={`letter ${ch}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        }

        {
          message && <p className="text-center my-5">{message}</p>
        }

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {
            status !== "won" 
              && <>
                <button
                  onClick={backspace}
                  className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
                  aria-label="Backspace"
                >
                  ⌫
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
                >
                  Clear
                </button>
                <button
                  onClick={reshuffle}
                  className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
                >
                  Shuffle
                </button>
              </>
          }

          <button
            onClick={reset}
            className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
          >
            ↺ Reset
          </button>

          {
            status === 'won' && <Link to="/" className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200">Continue  →</Link> 
          }
        </div>
      </div>
    </div>
  );
}
