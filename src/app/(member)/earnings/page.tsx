"use client";

import { useState } from "react";
import { Wallet, Download, TrendingUp } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";

const MONTHS = ["2024.07", "2024.06", "2024.05", "2024.04"];

const COMMISSIONS: Record<string, any[]> = {
  "2024.07": [
    { date: "2024.07.01", rule: "직접추천수당", source: "박지현", depth: 1, base: 320000, rate: 10, amount: 32000 },
    { date: "2024.07.01", rule: "직접추천수당", source: "오민정", depth: 1, base: 450000, rate: 10, amount: 45000 },
    { date: "2024.07.01", rule: "간접수당", source: "이준호", depth: 2, base: 120000, rate: 5, amount: 6000 },
    { date: "2024.07.01", rule: "간접수당", source: "강동현", depth: 2, base: 80000, rate: 5, amount: 4000 },
  ],
  "2024.06": [
    { date: "2024.06.30", rule: "직접추천수당", source: "한상욱", depth: 1, base: 450000, rate: 10, amount: 45000 },
    { date: "2024.06.30", rule: "직급수당", source: "—", depth: 0, base: 0, rate: 0, amount: 50000 },
    { date: "2024.06.29", rule: "직접추천수당", source: "박지현", depth: 1, base: 280000, rate: 10, amount: 28000 },
  ],
};

export default function MemberCommissionPage() {
  const [selectedMonth, setSelectedMonth] = useState("2024.07");
  const items = COMMISSIONS[selectedMonth] || [];
  const total = items.reduce((s, c) => s + c.amount, 0);
  const netTotal = Math.floor(total * 0.967);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">수당 내역</h2>
          <p className="text-text-muted text-sm mt-0.5">월별 수당 상세</p>
        </div>
        <button className="btn-outline flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" />
          지급명세서
        </button>
      </div>

      {/* 월 선택 */}
      <div className="flex gap-2 overflow-x-auto">
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
              selectedMonth === m ? "bg-gold/15 text-gold border-gold/25" : "bg-bg-elevated border-bg-border text-text-secondary hover:border-gold/20"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 합계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-xs text-text-muted">총 수당</span>
          </div>
          <p className="font-display text-xl font-bold text-gold">{formatKRW(total)}</p>
        </div>
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-soft" />
            <span className="text-xs text-text-muted">실지급 (세후)</span>
          </div>
          <p className="font-display text-xl font-bold text-emerald-soft">{formatKRW(netTotal)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">원천징수 3.3% 공제</p>
        </div>
      </div>

      {/* 내역 */}
      <div className="card">
        {items.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">수당 내역이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-bg-border">
            {items.map((c, i) => (
              <li key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.rule}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {c.source !== "—" && `${c.source} · `}
                    {c.depth > 0 && `${c.depth}단계`}
                    {c.rate > 0 && ` · ${c.base.toLocaleString()}원 × ${c.rate}%`}
                  </p>
                  <p className="text-[11px] text-text-muted">{c.date}</p>
                </div>
                <span className="text-sm font-semibold text-gold">+{c.amount.toLocaleString()}원</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
