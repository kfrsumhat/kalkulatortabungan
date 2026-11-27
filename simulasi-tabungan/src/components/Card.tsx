import type { ReactNode } from "react";
import { motion } from "motion/react";

/** Card dengan animasi masuk + hover (Motion). */
export function Card({ children, className = "", delay = 0, hover = true, id }: { children: ReactNode; className?: string; delay?: number; hover?: boolean; id?: string }) {
  return (
    <motion.div
      id={id}
      className={`rounded-3xl border border-bd bg-white shadow-card transition-shadow ${hover ? "hover:shadow-lift" : ""} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  );
}
