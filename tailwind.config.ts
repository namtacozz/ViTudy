import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        desk: {
          surface: "#0f1319",
          border: "#1e2638",
          mat: "#131824",
          wood: "#1c1815"
        },
        vitoken: {
          gold: "#f59e0b",
          glow: "#fbbf24",
          dark: "#78350f"
        },
        hud: {
          bg: "rgba(13, 17, 23, 0.75)",
          border: "rgba(56, 189, 248, 0.2)",
          glow: "rgba(56, 189, 248, 0.15)",
          cyan: "#38bdf8",
          neon: "#00f0ff"
        }
      },
      boxShadow: {
        'paper': '0 8px 30px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'book': '0 20px 50px rgba(0, 0, 0, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)',
        'hud-glow': '0 0 15px rgba(56, 189, 248, 0.25), inset 0 0 15px rgba(56, 189, 248, 0.1)',
        'vitoken-glow': '0 0 20px rgba(245, 158, 11, 0.4)'
      },
      animation: {
        'float-subtle': 'floatSubtle 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      }
    },
  },
  plugins: [],
};
export default config;
