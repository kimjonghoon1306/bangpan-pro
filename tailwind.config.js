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
          DEFAULT: "#08080E",
          surface: "#0F0F1A",
          elevated: "#161625",
          border: "#1E1E30",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E2C47A",
          dark: "#9A7B35",
        },
        accent: { DEFAULT: "#4F8EF7" },
        "emerald-soft": "#10B981",
        text: {
          primary: "#F0F0F8",
          secondary: "#8888AA",
          muted: "#444466",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["Pretendard Variable", "Pretendard", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "gold": "0 0 30px rgba(201, 168, 76, 0.2)",
        "gold-sm": "0 0 12px rgba(201, 168, 76, 0.15)",
        "elevated": "0 8px 40px rgba(0,0,0,0.6)",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
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
