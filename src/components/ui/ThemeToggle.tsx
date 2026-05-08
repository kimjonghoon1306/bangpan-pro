"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-105"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--bg-border)",
        color: "var(--text-muted)",
      }}
      title={isDark ? "라이트 모드" : "다크 모드"}
    >
      {isDark
        ? <Sun style={{ width: 16, height: 16 }} />
        : <Moon style={{ width: 16, height: 16 }} />
      }
    </button>
  );
}

