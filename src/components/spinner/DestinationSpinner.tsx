"use client";

// [CYCL:0351b220] Core animated spinner widget — manages spin state, Framer Motion animation, and result callback
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { pickRandom, type Country } from "@/lib/countries";

interface DestinationSpinnerProps {
  pool: Country[];
  onResult: (country: Country) => void;
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: () => void;
}

const SLOT_ITEMS_SHOWN = 5;

export default function DestinationSpinner({
  pool,
  onResult,
  isSpinning,
  onSpinStart,
  onSpinEnd,
}: DestinationSpinnerProps) {
  const [slotItems, setSlotItems] = useState<Country[]>([]);
  const [spinKey, setSpinKey] = useState(0);
  const resultRef = useRef<Country | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build a random sequence of flags for the slot machine effect
  function buildSlotSequence(finalCountry: Country, pool: Country[]): Country[] {
    const count = 12; // number of items to cycle through
    const randoms: Country[] = [];
    for (let i = 0; i < count - 1; i++) {
      randoms.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    randoms.push(finalCountry);
    return randoms;
  }

  const spin = useCallback(() => {
    if (pool.length === 0) return;
    const result = pickRandom(pool);
    if (!result) return;
    resultRef.current = result;
    const sequence = buildSlotSequence(result, pool);
    setSlotItems(sequence);
    setSpinKey((k) => k + 1);
    onSpinStart();

    // After animation completes (2.4s), fire onResult
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onResult(result);
      onSpinEnd();
    }, 2400);
  }, [pool, onSpinStart, onSpinEnd, onResult]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const canSpin = pool.length > 0 && !isSpinning;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pool count indicator */}
      <p className="text-white/70 text-sm">
        {pool.length === 0
          ? "No countries match — try clearing filters"
          : `${pool.length} destination${pool.length !== 1 ? "s" : ""} in the pool`}
      </p>

      {/* Slot machine window */}
      <div className="relative w-56 h-36 overflow-hidden rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-inner">
        {/* Center highlight stripe */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 border-y-2 border-white/40 bg-white/10 z-10 pointer-events-none" />

        <AnimatePresence mode="wait">
          {isSpinning ? (
            <motion.div
              key={spinKey}
              className="flex flex-col items-center"
              initial={{ y: 0 }}
              animate={{ y: -(slotItems.length - SLOT_ITEMS_SHOWN) * 64 }}
              transition={{
                duration: 2.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {slotItems.map((country, i) => (
                <div
                  key={`${country.code}-${i}`}
                  className="w-56 h-16 flex flex-col items-center justify-center shrink-0"
                >
                  <span className="text-4xl">{country.flag}</span>
                  <span className="text-white text-xs mt-0.5 font-medium truncate max-w-[10rem]">
                    {country.name}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="absolute inset-0 flex flex-col items-center justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-5xl">🌍</span>
              <span className="text-white/60 text-xs">Spin to discover</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spin button */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {resultRef.current && !isSpinning
          ? `Your destination is ${resultRef.current.name}`
          : ""}
      </div>

      <motion.button
        onClick={spin}
        disabled={!canSpin}
        whileTap={{ scale: canSpin ? 0.95 : 1 }}
        whileHover={{ scale: canSpin ? 1.04 : 1 }}
        className={`px-10 py-4 rounded-2xl text-lg font-bold shadow-lg transition-all ${
          canSpin
            ? "bg-white text-indigo-700 hover:bg-indigo-50 cursor-pointer"
            : "bg-white/30 text-white/50 cursor-not-allowed"
        }`}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              🌀
            </motion.span>
            Spinning…
          </span>
        ) : (
          "🎲 Spin the Globe"
        )}
      </motion.button>
    </div>
  );
}
