import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        matrix: {
          dark: "#050811",
          card: "#0b1120",
          cardHover: "#111a30",
          border: "#1f2e4d",
          accent: "#00ff9d",
          accentDark: "#00b36b",
          neonCyan: "#00e5ff",
          neonPurple: "#a855f7",
          neonGold: "#f59e0b",
          neonRed: "#ef4444",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "boss-hit": "bossHit 0.3s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 10px rgba(0, 255, 157, 0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 3px rgba(0, 255, 157, 0.2))" },
        },
        bossHit: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px) rotate(-2deg)" },
          "40%": { transform: "translateX(8px) rotate(2deg)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
