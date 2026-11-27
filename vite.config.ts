import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" agar hasil build bisa di-host di subpath (GitHub Pages) maupun root.
export default defineConfig({ base: "./", plugins: [react()], test: { environment: "node" } });
