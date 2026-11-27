import { useEffect, useState } from "react";
const Q = "(prefers-reduced-motion: reduce)";
export function useReducedMotion() {
  const [r, setR] = useState(() => typeof window !== "undefined" && window.matchMedia(Q).matches);
  useEffect(() => {
    const m = window.matchMedia(Q), f = () => setR(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return r;
}
