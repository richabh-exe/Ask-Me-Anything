"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
  tone: "info" | "success" | "warn";
}

const ToastContext = createContext<(message: string, tone?: ToastItem["tone"]) => void>(() => {});

const TONE: Record<ToastItem["tone"], string> = {
  info: "bg-white text-navy",
  success: "bg-white text-navy",
  warn: "bg-haldi-soft text-navy",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const reduce = useReducedMotion();

  const push = useCallback((message: string, tone: ToastItem["tone"] = "info") => {
    const id = ++next.current;
    setItems((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 5200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={`pointer-events-auto max-w-md rounded-[6px] border-2 border-navy px-4 py-3 text-[0.98rem] leading-snug shadow-[0_4px_0_var(--color-navy)] ${TONE[t.tone]}`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
