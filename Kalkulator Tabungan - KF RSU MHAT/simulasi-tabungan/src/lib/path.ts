/** Update imutabel berdasarkan path "a.b.0.c". */
export function setIn<T>(obj: T, path: string, val: unknown): T {
  const n = structuredClone(obj) as Record<string, unknown>;
  const ks = path.split(".");
  let o: Record<string, unknown> = n;
  for (const k of ks.slice(0, -1)) o = o[k] as Record<string, unknown>;
  o[ks[ks.length - 1]] = val;
  return n as T;
}
export const getIn = (obj: unknown, path: string): unknown => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
