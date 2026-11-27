import { motion } from "motion/react";
import type { ReactNode } from "react";
export function Chip({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button type="button" aria-pressed={!!on} onClick={onClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${on ? "border-g bg-g text-white" : "border-bd bg-white text-ink hover:border-g/50"}`}>
      {children}
    </motion.button>
  );
}
