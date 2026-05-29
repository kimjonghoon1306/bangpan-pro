"use client";

import { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-border) 50%, var(--bg-elevated) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <Skeleton height={12} width="40%" />
      <Skeleton height={height - 60} />
      <Skeleton height={12} width="60%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bg-border)" }}>
        <Skeleton height={14} width="30%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: "12px 16px", borderBottom: i < rows - 1 ? "1px solid var(--bg-border)" : "none" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={12} width={j === 0 ? "80%" : "60%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={10} width="50%" />
      <Skeleton height={28} width="70%" borderRadius={6} />
      <Skeleton height={10} width="40%" />
    </div>
  );
}

// 글로벌 shimmer 키프레임
export function SkeletonStyle() {
  return (
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
