"use client";

import { TrendingUp, Users, Wallet, ShoppingBag, ArrowUpRight, ChevronRight } from "lucide-react";
import { formatKRW } from "@/lib/utils";

const MEMBER = {
  name: "김민수",
  code: "M-012847",
  rank: "골드",
  rank_level: 3,
  sponsor: "이영희",
  personal_pv: 850,
  group_gv: 12400,
  left_volume: 6200,
  right_volume: 6200,
  this_month_commission: 247000,
  last_month_commission: 318000,
  total_commission: 4820000,
  direct_referrals: 8,
};

const RECENT_COMMISSIONS = [
  { date: "2024.07.01", desc: "직접추천수당 — 박지현", amount: 32000 },
  { date: "2024.07.01", desc: "간접수당 — 이준호", amount: 8000 },
  { date: "2024.06.30", desc: "직접추천수당 — 한상욱", amount: 45000 },
  { date: "2024.06.30", desc: "직급수당 — 골드 달성", amount: 50000 },
];

export default function PortalPage() {
  return (
    <div className="space-y-6">
      {/* 회원 정보 헤더 */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-elevated border border-bg-border p-6">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-gold text-[10px]">{MEMBER.rank}</span>
                <span className="text-xs text-text-muted font-mono">{MEMBER.code}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary">
                {MEMBER.name} 님
              </h2>
              <p className="text-text-muted text-sm mt-0.5">추천인: {MEMBER.sponsor}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">이번달 수당</p>
              <p className="font-display text-2xl font-bold text-gold">
                {formatKRW(MEMBER.this_month_commission)}
              </p>
              <p className="flex items-center justify-end gap-0.5 text-[11px] text-emerald-soft mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                지난달 대비 증가
              </p>
            </div>
          </div>

          {/* 스탯 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: "개인 PV", value: MEMBER.personal_pv.toLocaleString(), unit: "PV" },
              { label: "그룹 GV", value: MEMBER.group_gv.toLocaleString(), unit: "GV" },
              { label: "직추천", value: MEMBER.direct_referrals.toString(), unit: "명" },
              { label: "누적 수당", value: formatKRW(MEMBER.total_commission), unit: "" },
            ].map((s) => (
              <div key={s.label} className="bg-bg/50 border border-bg-border rounded-xl p-3">
                <p className="text-[11px] text-text-muted mb-1">{s.label}</p>
                <p className="text-sm font-bold text-text-primary">
                  {s.value}
                  {s.unit && <span className="text-xs text-text-muted ml-1 font-normal">{s.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 바이너리 볼륨 (해당 플랜일 때만) */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">조직 볼륨</h3>
          <span className="text-xs text-text-muted">이번달 기준</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { side: "좌측", volume: MEMBER.left_volume, color: "bg-gold" },
            { side: "우측", volume: MEMBER.right_volume, color: "bg-accent" },
          ].map((s) => (
            <div key={s.side}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">{s.side}</span>
                <span className="text-sm font-medium text-text-primary">
                  {s.volume.toLocaleString()} GV
                </span>
              </div>
              <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.color} transition-all duration-700`}
                  style={{ width: `${(s.volume / 20000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          매칭 볼륨: {Math.min(MEMBER.left_volume, MEMBER.right_volume).toLocaleString()} GV
        </p>
      </div>

      {/* 최근 수당 내역 */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">최근 수당 내역</h3>
          <button className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-0.5">
            전체보기 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <ul className="space-y-2">
          {RECENT_COMMISSIONS.map((c, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 border-b border-bg-border/50 last:border-0">
              <div>
                <p className="text-sm text-text-primary">{c.desc}</p>
                <p className="text-xs text-text-muted mt-0.5">{c.date}</p>
              </div>
              <span className="text-sm font-semibold text-gold">+{c.amount.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
