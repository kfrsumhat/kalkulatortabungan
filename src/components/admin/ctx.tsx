import { createContext, useContext } from "react";
import type { Config } from "../../types/config.ts";
import type { Errors } from "../../lib/validate.ts";

export interface AdminCtx { cfg: Config; set: (path: string, v: unknown) => void; update: (fn: (c: Config) => Config) => void; errors: Errors }
export const ACtx = createContext<AdminCtx | null>(null);
export const useAdmin = () => { const c = useContext(ACtx); if (!c) throw new Error("AdminCtx"); return c; };
