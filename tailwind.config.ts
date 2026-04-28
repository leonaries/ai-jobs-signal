import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151713",
        paper: "#f6f3ea",
        field: "#e7eadb",
        signal: "#d7462b",
        moss: "#4c6b4b",
        steel: "#31566a",
        citron: "#d6d95b"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "Georgia", "serif"]
      },
      boxShadow: {
        rule: "0 1px 0 rgba(21,23,19,0.16)",
        panel: "0 20px 60px rgba(21,23,19,0.12)"
      }
    }
  },
  plugins: []
};

export default config;
