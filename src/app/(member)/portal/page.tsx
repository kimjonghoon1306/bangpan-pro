"use client";

import { TrendingUp, Users, Wallet, ShoppingBag, ChevronRight, ArrowUpRight } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import Link from "next/link";

const MEMBER = {
  name: "김민수", code: "M-012847", rank: "골드",
  personal_pv: 850, group_gv: 12400,
  left_volume: 6800, right_volume: 5600,
  this_month: 247000, last_month: 198000,
  total: 4820000, direct: 8,
};

const COMMISSIONS = [
  { desc: "직접추천수당 — 박지현", amount: 32000, date: "07.01", type: "추천" },
  { desc: "직접추천수당 — 오민정", amount: 45000, date: "07.01", type: "추천" },
  { desc: "간접수당 — 이준호", amount: 6000, date: "07.01", type: "간접" },
  { desc: "간접수당 — 강동현", amount: 4000, date: "07.01", type: "간접" },
];

const QUICK = [
  { label: "내 조직", href: "/network", icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.08)" },
  { label: "수당 내역", href: "/earnings", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { label: "쇼핑몰", href: "/shop", icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)" },
];

export default function PortalPage() {
  const growth = Math.round(((MEMBER.this_month - MEMBER.last_month) / MEMBER.last_month) * 100);
  const maxVol = Math.max(MEMBER.left_volume, MEMBER.right_volume);

  return (
    <div>
      {/* ─── 히어로 카드 ─── */}
      <div className="animate-slide-up" style={{
        position: "relative", overflow: "hidden",
        background: "var(--bg-elevated)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "20px", padding: "24px", marginBottom: "20px",
      }}>
        {/* SVG 배경 */}
        <svg style={{ position: "absolute", right: 0, top: 0, opacity: 0.06 }} width="200" height="160" viewBox="0 0 200 160">
          <circle cx="160" cy="40" r="80" fill="#C9A84C" />
          <circle cx="180" cy="120" r="50" fill="#C9A84C" />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(201,168,76,0.03) 0%, transparent 60%)", borderRadius: "20px" }} />

        <div style={{ position: "relative" }}>
          {/* 상단 */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span className="badge badge-gold">{MEMBER.rank}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{MEMBER.code}</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
                {MEMBER.name} 님
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>이번달 수당</p>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne, sans-serif" }}>
                {formatKRW(MEMBER.this_month)}
              </p>
              <p style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", fontSize: "11px", color: "var(--emerald)", marginTop: "2px" }}>
                <ArrowUpRight size={12} />+{growth}% 지난달 대비
              </p>
            </div>
          </div>

          {/* 스탯 그리드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {[
              { label: "개인 PV", value: MEMBER.personal_pv.toLocaleString() },
              { label: "그룹 GV", value: MEMBER.group_gv.toLocaleString() },
              { label: "직추천", value: `${MEMBER.direct}명` },
              { label: "누적수당", value: "₩4.8M" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px 10px", textAlign: "center",
              }}>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{s.label}</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2열 레이아웃 (PC) / 1열 (모바일) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}
        className="max-md:block max-md:space-y-4">

        {/* 볼륨 카드 */}
        <div className="card-elevated animate-slide-up delay-100">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>조직 볼륨</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>이번달 기준</span>
          </div>
          {[
            { side: "좌측", vol: MEMBER.left_volume, color: "#C9A84C" },
            { side: "우측", vol: MEMBER.right_volume, color: "#4F8EF7" },
          ].map((s) => (
            <div key={s.side} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.side}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {s.vol.toLocaleString()} GV
                </span>
              </div>
              <div style={{ height: "8px", background: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "4px",
                  background: `linear-gradient(90deg, ${s.color}99, ${s.color})`,
                  width: `${(s.vol / maxVol) * 100}%`,
                  transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: `0 0 8px ${s.color}66`,
                }} />
              </div>
            </div>
          ))}
          <div style={{
            marginTop: "12px", padding: "10px", borderRadius: "10px",
            background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>매칭 볼륨</p>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne, sans-serif" }}>
              {Math.min(MEMBER.left_volume, MEMBER.right_volume).toLocaleString()} GV
            </p>
          </div>
        </div>

        {/* 최근 수당 */}
        <div className="card-elevated animate-slide-up delay-200">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 수당</h3>
            <Link href="/earnings" style={{
              fontSize: "12px", color: "var(--gold)", textDecoration: "none",
              display: "flex", alignItems: "center", gap: "2px",
            }}>
              전체 <ChevronRight size={13} />
            </Link>
          </div>
          <ul>
            {COMMISSIONS.map((c, i) => (
              <li key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: i < COMMISSIONS.length - 1 ? "1px solid var(--bg-border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: c.type === "추천" ? "rgba(201,168,76,0.1)" : "rgba(79,142,247,0.1)",
                    border: `1px solid ${c.type === "추천" ? "rgba(201,168,76,0.2)" : "rgba(79,142,247,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 700,
                    color: c.type === "추천" ? "var(--gold)" : "var(--accent)",
                  }}>{c.type}</div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{c.desc}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.date}</p>
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>
                  +{c.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── 빠른 메뉴 ─── */}
      <div className="animate-slide-up delay-300" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {QUICK.map((q) => (
          <Link key={q.label} href={q.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: q.bg, border: `1px solid ${q.bg.replace("0.08", "0.2")}`,
              borderRadius: "16px", padding: "20px 16px", textAlign: "center",
              transition: "all 0.2s", cursor: "pointer",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${q.bg}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "12px", margin: "0 auto 10px",
                background: q.bg, border: `1px solid ${q.bg.replace("0.08", "0.25")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <q.icon size={22} color={q.color} />
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{q.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
