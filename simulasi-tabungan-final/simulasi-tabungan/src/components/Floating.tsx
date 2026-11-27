import { AnimatePresence, motion } from "motion/react";
import { IconWa } from "./icons.tsx";

/** Tombol WA melayang (mobile). Muncul hanya bila ada hasil; tinggi halaman diberi ruang di App. */
export function FloatingWA({ show, href }: { show: boolean; href: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.a href={href} target="_blank" rel="noopener noreferrer" aria-label="Daftar via WhatsApp"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} whileTap={{ scale: 0.96 }}
          className="fixed inset-x-4 z-30 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 py-3.5 font-bold text-[#06301b] shadow-lift lg:hidden"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <IconWa /> Daftar via WhatsApp
        </motion.a>
      )}
    </AnimatePresence>
  );
}
