import { motion } from "motion/react";
import type { Product } from "../types/config.ts";

export function ProductTabs({ products, cur, onPick }: { products: Product[]; cur: string; onPick: (id: string) => void }) {
  return (
    <div role="tablist" aria-label="Pilih produk" className="relative z-20 mx-auto mt-5 grid max-w-6xl grid-cols-2 gap-2.5 px-4 lg:grid-cols-4">
      {products.map((p) => {
        const on = p.id === cur;
        return (
          <motion.button key={p.id} role="tab" aria-selected={on} aria-controls="panel-sim" id={`tab-${p.id}`} onClick={() => onPick(p.id)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left shadow-card transition-colors ${on ? "border-g bg-g2 text-g" : "border-bd bg-white text-ink hover:border-g/40"}`}>
            <span className="text-2xl" aria-hidden="true">{p.icon}</span>
            <span className="min-w-0"><span className="block text-sm font-semibold leading-tight sm:truncate sm:text-base">{p.nm}</span>
              <span className="block truncate text-xs text-mut">{p.sub}</span></span>
          </motion.button>
        );
      })}
    </div>
  );
}
