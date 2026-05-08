/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          border: "var(--bg-border)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        accent: { DEFAULT: "var(--accent)" },
        "emerald-soft": "var(--emerald)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["Pretendard Variable", "Pretendard", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,168,76,0.2)",
        "gold-sm": "0 0 12px rgba(201,168,76,0.15)",
        elevated: "var(--shadow)",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.5s ease forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
