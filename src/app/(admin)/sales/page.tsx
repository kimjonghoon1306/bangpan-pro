"use client";

import { useState } from "react";
import {
  TrendingUp, ShoppingBag, Users, Wallet,
  ArrowUpRight, ArrowDownRight, Calendar,
  Download, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { formatKRW } from "@/lib/utils";

const DAILY = [
  { date: "5/1", revenue: 8200000, orders: 42 },
  { date: "5/2", revenue: 6800000, orders: 35 },
  { date: "5/3", revenue: 9400000, orders: 48 },
  { date: "5/4", revenue: 7100000, orders: 37 },
  { date: "5/5", revenue: 11200000, orders: 58 },
  { date: "5/6", revenue: 9800000, orders: 51 },
  { date: "5/7", revenue: 8600000, orders: 44 },
  { date: "5/8", revenue: 12400000, orders: 64 },
  { date: "5/9", revenue: 10200000, orders: 53 },
  { date: "5/10", revenue: 9600000, orders: 49 },
  { date: "5/11", revenue: 13800000, orders: 71 },
];

const WEEKLY = [
  { date: "1주차", revenue: 52000000, orders: 268 },
  { date: "2주차", revenue: 61000000, orders: 314 },
  { date: "3주차", revenue: 58000000, orders: 298 },
  { date: "4주차", revenue: 71000000, orders: 365 },
];

const MONTHLY = [
  { date: "1월", revenue: 320000000, orders: 1640 },
  { date: "2월", revenue: 280000000, orders: 1430 },
  { date: "3월", revenue: 390000000, orders: 2010 },
  { date: "4월", revenue: 420000000, orders: 2160 },
  { date: "5월", revenue: 242000000, orders: 1245 },
];

const PRODUCTS = [
  { name: "프리미엄 영양제 세트", sales: 842, revenue: 74978000, pv: 67360 },
  { name: "콜라겐 음료 30포", sales: 1240, revenue: 73520000, pv: 62000 },
  { name: "프로바이오틱스 플러스", sales: 680, revenue: 46240000, pv: 40800 },
  { name: "비타민 C 1000mg", sales: 920, revenue: 35880000, pv: 32200 },
  { name: "홍삼정 골드", sales: 320, revenue: 40960000, pv: 35200 },
];

const RANK_DIST = [
  { name: "일반", value: 7420, color: "#444466" },
  { name: "실버", value: 3280, color: "#94A3B8" },
  { name: "골드", value: 1640, color: "#C9A84C" },
  { name: "플래티넘", value: 380, color: "#818CF8" },
  { name: "다이아", value: 127, color: "#38BDF8" },
];

const RECENT_ORDERS = [
  { code: "ORD-20240511-000142", member: "김민수", amount: 248000, pv: 210, status: "DELIVERED" },
  { code: "ORD-20240511-000141", member: "박지현", amount: 89000, pv: 80, status: "SHIPPING" },
  { code: "ORD-20240511-000140", member: "오민정", amount: 178000, pv: 160, status: "PAID" },
  { code: "ORD-20240511-000139", member: "한상욱", amount: 59000, pv: 50, status: "PAID" },
  { code: "ORD-20240511-000138", member: "이준호", amount: 392000, pv: 340, status: "DELIVERED" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PAID:      { label: "결제완료", color: "#93C5FD", bg: "rgba(79,142,247,0.12)" },
  SHIPPING:  { label: "배송중",   color: "#C4B5FD", bg: "rgba(167,139,250,0.12)" },
  DELIVERED: { label: "배송완료", color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
  CANCELLED: { label: "취소",     color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px" }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.dataKey === "revenue" ? formatKRW(p.value) : `${p.value}건`}
        </p>
      ))}
    </div>
  );
}

export default function SalesPage() {
  const [period, setPeriod] = useState<"daily"|"weekly"|"monthly">("daily");
  const data = period === "daily" ? DAILY : period === "weekly" ? WEEKLY : MONTHLY;
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>매출 관리</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>2024년 5월 기준</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "3px", gap: "2px" }}>
            {(["daily","weekly","monthly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                background: period === p ? "rgba(201,168,76,0.15)" : "transparent",
                border: `1px solid ${period === p ? "rgba(201,168,76,0.3)" : "transparent"}`,
                color: period === p ? "var(--gold)" : "var(--text-secondary)",
              }}>
                {p === "daily" ? "일별" : p === "weekly" ? "주별" : "월별"}
              </button>
            ))}
          </div>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}>
            <Download size={14} /> 내보내기
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {[
          { label: "총 매출", value: formatKRW(totalRevenue), sub: "이번 기간", icon: TrendingUp, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", change: "+12.4%", up: true },
          { label: "총 주문", value: `${totalOrders.toLocaleString()}건`, sub: "이번 기간", icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)", change: "+8.2%", up: true },
          { label: "평균 주문액", value: formatKRW(Math.floor(totalRevenue / totalOrders)), sub: "건당 평균", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.08)", change: "+3.8%", up: true },
          { label: "활성 회원", value: "10,847명", sub: "이번달 구매", icon: Users, color: "#A78BFA", bg: "rgba(167,139,250,0.08)", change: "+5.1%", up: true },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", right: -8, top: -8, opacity: 0.06 }} width="80" height="80" viewBox="0 0 80 80"><circle cx="60" cy="20" r="40" fill={s.color} /></svg>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} color={s.color} />
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: 600, color: s.up ? "var(--emerald)" : "#F87171" }}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{s.change}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{s.label}</p>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 차트 + 직급 분포 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "14px" }} className="max-lg:block max-lg:space-y-4">
        {/* 매출 차트 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>매출 추이</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ width: 10, height: 3, borderRadius: "2px", background: "var(--gold)", display: "inline-block" }} /> 매출
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ width: 10, height: 3, borderRadius: "2px", background: "#4F8EF7", display: "inline-block" }} /> 주문수
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: "#C9A84C" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 직급 분포 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>회원 직급 분포</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={RANK_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {RANK_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v.toLocaleString()}명`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            {RANK_DIST.map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.name}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{r.value.toLocaleString()}명</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상품별 매출 + 최근 주문 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="max-lg:block max-lg:space-y-4">
        {/* 상품별 매출 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--bg-border)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>상품별 매출 TOP 5</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["상품명","판매수","매출","PV"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: i === 0 ? "rgba(201,168,76,0.2)" : "var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: i === 0 ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }}>{i+1}</span>
                        <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.sales.toLocaleString()}개</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--gold)", whiteSpace: "nowrap" }}>{formatKRW(p.revenue)}</td>
                    <td style={{ padding: "11px 14px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{p.pv.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 최근 주문 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 주문</h3>
            <button style={{ fontSize: "12px", color: "var(--gold)", background: "none", border: "none", cursor: "pointer" }}>전체보기 →</button>
          </div>
          <div>
            {RECENT_ORDERS.map((o, i) => {
              const s = STATUS_MAP[o.status];
              return (
                <div key={o.code} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < RECENT_ORDERS.length-1 ? "1px solid var(--bg-border)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.member}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{o.code}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)" }}>{formatKRW(o.amount)}</p>
                    <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

