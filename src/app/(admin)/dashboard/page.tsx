"use client";

import {
  Users, TrendingUp, ShoppingBag, Wallet,
  ArrowUpRight, ArrowDownRight, UserPlus,
  Calculator, Activity, RefreshCw,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px" }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      <p style={{ color: "var(--gold)", fontWeight: 600 }}>{payload[0].value}만원</p>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, loading, revenueData } = useDashboard();

  const STATS = [
    { label: "전체 회원", value: loading ? "..." : stats.total_members.toLocaleString(), sub: `오늘 +${stats.new_today}명`, icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.08)" },
    { label: "이번달 매출", value: loading ? "..." : formatKRW(stats.monthly_revenue), sub: `주문 ${stats.monthly_orders}건`, icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
    { label: "처리 대기", value: loading ? "..." : `${stats.pending_orders}건`, sub: "결제 대기 주문", icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)" },
    { label: "이달 수당", value: loading ? "..." : formatKRW(stats.monthly_commission), sub: "지급 예정", icon: Wallet, color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
  ];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>대시보드</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>실시간 현황</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--emerald)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--emerald)", animation: "glowPulse 2s infinite", display: "inline-block" }} />
          실시간 연동
        </div>
      </div>

      {/* 스탯 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="animate-slide-up" style={{ animationDelay: `${i*70}ms`, background: "var(--bg-elevated)", border: `1px solid ${s.bg.replace("0.08","0.2")}`, borderRadius: "14px", padding: "16px", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", right: -8, top: -8, opacity: 0.06 }} width="80" height="80" viewBox="0 0 80 80"><circle cx="60" cy="20" r="40" fill={s.color} /></svg>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{s.label}</p>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 7일 매출</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>단위: 만원</span>
        </div>
        {loading ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={20} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: "#C9A84C" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 빠른 액션 */}
      <div>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>빠른 실행</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {[
            { label: "회원 등록", icon: UserPlus, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", href: "/members/new" },
            { label: "수당 계산", icon: Calculator, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)", href: "/settlement" },
            { label: "주문 관리", icon: ShoppingBag, color: "#10B981", bg: "rgba(16,185,129,0.08)", href: "/orders" },
            { label: "플랜 설정", icon: Activity, color: "#A78BFA", bg: "rgba(167,139,250,0.08)", href: "/plan" },
          ].map((a) => (
            <a key={a.label} href={a.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "12px", background: a.bg, border: `1px solid ${a.bg.replace("0.08","0.2")}`, transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
            >
              <a.icon size={18} color={a.color} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
