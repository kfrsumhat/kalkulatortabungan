import type { Config } from "../types/config.ts";

const DRAFT = "sim.draft.v1";
const HIST = "sim.history.v1";
export interface Version { ts: number; label: string; config: Config }

const rd = <T,>(k: string, fb: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* kuota penuh / diblokir */ } };

export const loadDraft = () => rd<Config | null>(DRAFT, null);
export const saveDraft = (c: Config) => wr(DRAFT, c);
export const clearDraft = () => { try { localStorage.removeItem(DRAFT); } catch { /* noop */ } };
export const loadHistory = () => rd<Version[]>(HIST, []);
export function pushHistory(c: Config, label: string) {
  const h = [{ ts: Date.now(), label, config: c }, ...loadHistory()].slice(0, 10);
  wr(HIST, h);
  return h;
}
