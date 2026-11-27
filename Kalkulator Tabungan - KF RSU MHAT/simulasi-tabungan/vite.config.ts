import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Content-Security-Policy hanya disisipkan saat build produksi (dev server butuh skrip inline untuk HMR).
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:",
  "font-src 'self' data:", "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "manifest-src 'self'",
].join("; ");
const csp = (): Plugin => ({
  name: "csp-meta", apply: "build",
  transformIndexHtml: (html) => html.replace("</title>", `</title>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
});

// base "./" agar hasil build bisa di-host di subpath (GitHub Pages) maupun root.
export default defineConfig({ base: "./", plugins: [react(), csp()], test: { environment: "node" } });
