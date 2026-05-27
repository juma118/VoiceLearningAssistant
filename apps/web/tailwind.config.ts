import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d2b1b",
        mint: {
          50: "#fbfff4",
          100: "#f1ffe4",
          200: "#e4ffd0"
        },
        sage: {
          300: "#a6de8f",
          400: "#8bd274",
          500: "#68b84e",
          600: "#4d9139"
        },
        blush: {
          100: "#ffe3e9",
          300: "#ffb8c5",
          400: "#ff9caf",
          500: "#f47291"
        },
        brand: {
          50: "#f1ffe4",
          100: "#e4ffd0",
          500: "#68b84e",
          600: "#4d9139",
          700: "#2f6428"
        }
      }
    }
  },
  plugins: []
};

export default config;
