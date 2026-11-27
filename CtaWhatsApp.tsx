import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { IconWa } from "./icons.tsx";

interface Props { daftar: string; tanya: string; privacy: string; summary: string; pulse: boolean }

/** Card CTA WhatsApp di bawah hasil. Data hanya terkirim saat nasabah menekan tombol. */
export function CtaWhatsApp({ daftar, tanya, privacy, summary, pulse }: Props) {
  const controls = useAnimationControls();
  const done = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pulse && !done.current) { done.current = true; controls.start({ scale: [1, 1.025, 1], transition: { duration: 0.7 } }); }
  }, [pulse, controls]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(summary); }
    catch { const t = document.createElement("textarea"); t.value = summary; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
      <motion.section animate={controls} aria-labelledby="cta-t" className="rounded-3xl border border-bd bg-white p-5 shadow-card">
        <h3 id="cta-t" className="text-lg font-semibold text-ink">Tertarik? Daftar atau tanya langsung via WhatsApp</h3>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <motion.a href={daftar} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-4 py-3.5 font-bold text-[#06301b] shadow-card">
            <IconWa /> 💬 Daftar via WhatsApp
          </motion.a>
          <motion.a href={tanya} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center rounded-2xl border-2 border-[#25d366] px-4 py-3.5 font-semibold text-ink">
            Tanya dulu via WhatsApp
          </motion.a>
        </div>
        {summary && (
          <button type="button" onClick={copy} className="mt-3 text-sm font-semibold text-g underline underline-offset-2">
            {copied ? "Tersalin ✓" : "Salin ringkasan"}
          </button>
        )}
        <p className="mt-3 text-xs leading-relaxed text-mut">{privacy}</p>
      </motion.section>
    </motion.div>
  );
}
