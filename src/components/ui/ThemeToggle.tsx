"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) return <div style={{ width: size === "sm" ? 32 : 36, height: size === "sm" ? 32 : 36 }} />;

  const sz = size === "sm" ? 32 : 36;

  return (
    <button onClick={toggle} title={isDark ? "라이트 모드" : "다크 모드"} style={{
      width: sz, height: sz, borderRadius: "9px",
      background: isDark ? "rgba(255,255,255,0.06)" : "var(--bg-border)",
      border: "1.5px solid var(--bg-border)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--violet)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.15)"/>
          {[0,45,90,135,180,225,270,315].map((deg,i)=>(
            <line key={i} x1={12+8*Math.cos(deg*Math.PI/180)} y1={12+8*Math.sin(deg*Math.PI/180)} x2={12+10.5*Math.cos(deg*Math.PI/180)} y2={12+10.5*Math.sin(deg*Math.PI/180)} stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
          ))}
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="var(--text-secondary)" strokeWidth="2" fill="rgba(100,100,150,0.1)" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}
