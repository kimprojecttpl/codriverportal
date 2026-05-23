import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Thai", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(8,145,178,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        "glass-lg":
          "0 20px 60px rgba(8,145,178,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        "glow-cyan": "0 0 24px rgba(6,182,212,0.35)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.30)",
      },
      backdropBlur: {
        xl: "20px",
        "2xl": "32px",
      },
      transitionTimingFunction: {
        liquid: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
