"use client";

import {
  Users, TrendingUp, ShoppingBag, Wallet,
  ArrowUpRight, ArrowDownRight, UserPlus,
  Calculator, Activity,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATS = [
  {
    label: "전체 회원", value: "12,847", sub: "오늘 +23명",
    change: "+1.2%", up: true, icon: Users, color: "#C9A84C",
    bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)",
  },
  {
    label: "이번달 매출", value: "₩482M", sub: "목표 85% 달성",
    change: "+12.4%", up: true, icon: TrendingUp, color: "#10B981",
    bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
  },
  {
    label: "이번달 주문", value: "3,241", sub: "대기 12건",
    change: "+8.2%", up: true, icon: ShoppingBag, color: "#4F8EF7",
    bg: "rgba(79,142,247,0.08)", border: "rgba(79,142,247,0.2)",
  },
  {
    label: "지급예정 수당", value: "₩38.4M", sub: "정산일 D-6",
    change: "-2.1%", up: false, icon: Wallet, color: "#C9A84C",
    bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)",
  },
];

const CHART_DATA = [
  { month: "1월", revenue: 320 },
  { month: "2월", revenue: 280 },
  { month: "3월", revenue: 390 },
  { month: "4월", revenue: 420 },
  { month: "5월", revenue: 380 },
  { month: "6월", revenue: 450 },
  { month: "7월", revenue: 482 },
];

const RECENT = [
  { name: "김민수", code: "M-012847", rank: "골드", rankCls: "badge-gold", joined: "07.01", sponsor: "이영희" },
  { name: "박지현", code: "M-012846", rank: "실버", rankCls: "badge-blue", joined: "07.01", sponsor: "최강산" },
  { name: "이준호", code: "M-012845", rank: "일반", rankCls: "badge-gray", joined: "06.30", sponsor: "김민수" },
  { name: "정수아", code: "M-012844", rank: "일반", rankCls: "badge-gray", joined: "06.30", sponsor: "박지현" },
  { name: "한상욱", code: "M-012843", rank: "실버", rankCls: "badge-blue", joined: "06.29", sponsor: "이준호" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
      borderRadius: "10px", padding: "10px 14px", fontSize: "12px",
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      <p style={{ color: "var(--gold)", fontWeight: 700 }}>{payload[0].value}백만원</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "100%" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: "24px" }} className="animate-slide-up">
        <h1 style={{
          fontFamily: "Syne, sans-serif", fontSize: "24px", fontWeight: 800,
          color: "var(--text-primary)",
        }}>대시보드</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontSize: "12px", color: "var(--emerald)",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--emerald)", display: "inline-block",
              animation: "glowPulse 2s infinite",
            }} />
            실시간 동기화
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>· 2024년 7월</span>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px", marginBottom: "24px",
      }}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="animate-slide-up"
            style={{
              animationDelay: `${i * 70}ms`,
              background: "var(--bg-elevated)",
              border: `1px solid ${s.border}`,
              borderRadius: "16px", padding: "20px",
              position: "relative", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${s.bg}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* SVG 배경 장식 */}
            <svg style={{ position: "absolute", right: -10, top: -10, opacity: 0.08 }} width="80" height="80" viewBox="0 0 80 80">
              <circle cx="60" cy="20" r="40" fill={s.color} />
            </svg>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "12px",
                background: s.bg, border: `1px solid ${s.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <s.icon size={20} color={s.color} />
              </div>
              <span style={{
                display: "flex", alignItems: "center", gap: "2px",
                fontSize: "12px", fontWeight: 600,
                color: s.up ? "var(--emerald)" : "var(--red)",
              }}>
                {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {s.change}
              </span>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>{s.label}</p>
            <p style={{
              fontSize: "22px", fontWeight: 800, color: "var(--text-primary)",
              fontFamily: "Syne, sans-serif",
            }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 차트 + 최근 가입 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", marginBottom: "24px" }}
        className="max-lg:block max-lg:space-y-4">
        {/* 매출 차트 */}
        <div className="card-elevated animate-slide-up delay-300">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>월별 매출 추이</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>단위: 백만원</p>
            </div>
            {/* SVG 장식 */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(201,168,76,0.1)" />
              <polyline points="6,22 12,14 18,17 26,8" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="26" cy="8" r="2.5" fill="var(--gold)" />
            </svg>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5} fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: "#C9A84C", stroke: "var(--bg)", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 최근 가입 */}
        <div className="card-elevated animate-slide-up delay-400">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>최근 가입 회원</h3>
            <UserPlus size={16} color="var(--text-muted)" />
          </div>
          <ul>
            {RECENT.map((m, i) => (
              <li key={m.code} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 0",
                borderBottom: i < RECENT.length - 1 ? "1px solid var(--bg-border)" : "none",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: "var(--bg)", border: "1px solid var(--bg-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600,
                }}>{m.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</span>
                    <span className={`badge ${m.rankCls}`} style={{ fontSize: "10px", padding: "1px 7px" }}>{m.rank}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.code} · {m.sponsor}</p>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{m.joined}</span>
              </li>
            ))}
          </ul>
          <button className="btn-outline" style={{ width: "100%", marginTop: "14px", padding: "9px", fontSize: "13px" }}>
            전체 보기 →
          </button>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="animate-slide-up delay-500">
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>빠른 실행</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {[
            { label: "회원 등록", icon: UserPlus, color: "#C9A84C", bg: "rgba(201,168,76,0.08)" },
            { label: "수당 계산", icon: Calculator, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)" },
            { label: "주문 관리", icon: ShoppingBag, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
            { label: "플랜 설정", icon: Activity, color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
          ].map((a) => (
            <button
              key={a.label}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px", borderRadius: "14px",
                background: a.bg, border: `1px solid ${a.bg.replace("0.08", "0.2")}`,
                cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${a.bg}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "10px",
                background: a.bg, border: `1px solid ${a.bg.replace("0.08", "0.25")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <a.icon size={18} color={a.color} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
