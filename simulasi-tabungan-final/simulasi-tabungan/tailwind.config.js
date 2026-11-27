/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { g: "var(--g)", g2: "var(--g2)", ink: "var(--ink)", mut: "var(--mut)", bd: "var(--bd)", bg: "var(--bg)", ac: "var(--ac)" },
      fontFamily: { sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "Helvetica Neue", "Arial", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(42,26,29,.04), 0 8px 24px -12px rgba(122,28,46,.18)", lift: "0 2px 4px rgba(42,26,29,.06), 0 18px 36px -14px rgba(122,28,46,.32)" },
    },
  },
  plugins: [],
};
