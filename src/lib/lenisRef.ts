import type Lenis from "lenis";
export const lenisRef: { current: Lenis | null } = { current: null };
export function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -12 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
