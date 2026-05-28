"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Users, Wallet, ArrowUpRight, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px" }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.dataKey === "revenue" ? formatKRW(p.value * 10000) : `${p.value}건`}
        </p>
      ))}
    </div>
  );
}

export default function SalesPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [rankDist, setRankDist] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState({ revenue: 0, orders: 0, activeMembers: 0, commission: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const now = new Date();

      // 차트 데이터 생성
      const days = period === "daily" ? 14 : period === "weekly" ? 8 : 6;
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        let start: Date, end: Date, label: string;
        if (period === "daily") {
          start = new Date(now); start.setDate(now.getDate() - i); start.setHours(0,0,0,0);
          end = new Date(start); end.setDate(start.getDate() + 1);
          label = `${start.getMonth()+1}/${start.getDate()}`;
        } else if (period === "weekly") {
          start = new Date(now); start.setDate(now.getDate() - i * 7); start.setHours(0,0,0,0);
          end = new Date(start); end.setDate(start.getDate() + 7);
          label = `${i === 0 ? "이번주" : `${i}주전`}`;
        } else {
          start = new Date(now.getFullYear(), now.getMonth() - i, 1);
          end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          label = `${start.getMonth()+1}월`;
        }
        const { data: orders } = await supabase.from("orders").select("total_price").eq("status", "PAID").neq("status", "CANCELLED").gte("paid_at", start.toISOString()).lt("paid_at", end.toISOString());
        const rev = orders?.reduce((s: number, o: any) => s + o.total_price, 0) ?? 0;
        data.push({ date: label, revenue: Math.floor(rev / 10000), orders: orders?.length ?? 0 });
      }
      setChartData(data);

      // 이번달 요약
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const [{ data: monthOrders }, { count: activeMembers }, { data: settlement }] = await Promise.all([
        supabase.from("orders").select("total_price").eq("status", "PAID").gte("paid_at", monthStart),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "ACTIVE").eq("is_admin", false),
        supabase.from("settlement_periods").select("total_commission").eq("year", now.getFullYear()).eq("month", now.getMonth() + 1).single(),
      ]);
      const totalRev = monthOrders?.reduce((s: number, o: any) => s + o.total_price, 0) ?? 0;
      setSummary({ revenue: totalRev, orders: monthOrders?.length ?? 0, activeMembers: activeMembers ?? 0, commission: (settlement as any)?.total_commission ?? 0 });

      // 상품별 매출 TOP 5
      const { data: items } = await supabase.from("order_items").select("product_name, quantity, unit_price, unit_pv").limit(500);
      const prodMap: Record<string, { sales: number; revenue: number; pv: number }> = {};
      (items ?? []).forEach((i: any) => {
        if (!prodMap[i.product_name]) prodMap[i.product_name] = { sales: 0, revenue: 0, pv: 0 };
        prodMap[i.product_name].sales += i.quantity;
        prodMap[i.product_name].revenue += i.unit_price * i.quantity;
        prodMap[i.product_name].pv += i.unit_pv * i.quantity;
      });
      const top5 = Object.entries(prodMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setTopProducts(top5);

      // 직급 분포
      const { data: ranks } = await supabase.from("ranks").select("id, name, color");
      const rankCounts = await Promise.all((ranks ?? []).map(async (r: any) => {
        const { count } = await supabase.from("members").select("*", { count: "exact", head: true }).eq("rank_id", r.id).eq("is_admin", false);
        return { name: r.name, value: count ?? 0, color: r.color };
      }));
      setRankDist(rankCounts.filter(r => r.value > 0));

      // 최근 주문 5건
      const { data: recent } = await supabase.from("orders").select("order_code, total_price, status, member:members(name)").order("created_at", { ascending: false }).limit(5);
      setRecentOrders((recent as any) ?? []);

      setLoading(false);
    }
    load();
  }, [period]);

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue * 10000, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    PAID:      { label: "결제완료", color: "#93C5FD", bg: "rgba(79,142,247,0.12)" },
    SHIPPING:  { label: "배송중",   color: "#C4B5FD", bg: "rgba(167,139,250,0.12)" },
    DELIVERED: { label: "배송완료", color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
    CANCELLED: { label: "취소",     color: "#F87171", bg: "rgba(239,68,68,0.12)" },
    PENDING:   { label: "결제대기", color: "var(--gold)", bg: "rgba(201,168,76,0.12)" },
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>매출 관리</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>실시간 연동</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "3px", gap: "2px" }}>
            {(["daily","weekly","monthly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: period === p ? "rgba(201,168,76,0.15)" : "transparent", border: `1px solid ${period === p ? "rgba(201,168,76,0.3)" : "transparent"}`, color: period === p ? "var(--gold)" : "var(--text-secondary)" }}>
                {p === "daily" ? "일별" : p === "weekly" ? "주별" : "월별"}
              </button>
            ))}
          </div>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}><Download size={14} /> 내보내기</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {[
          { label: "이번달 매출", value: formatKRW(summary.revenue), icon: TrendingUp, color: "#C9A84C", bg: "rgba(201,168,76,0.08)" },
          { label: "이번달 주문", value: `${summary.orders}건`, icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)" },
          { label: "이달 수당", value: formatKRW(summary.commission), icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
          { label: "활성 회원", value: `${summary.activeMembers.toLocaleString()}명`, icon: Users, color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", right: -8, top: -8, opacity: 0.06 }} width="80" height="80" viewBox="0 0 80 80"><circle cx="60" cy="20" r="40" fill={s.color} /></svg>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><s.icon size={18} color={s.color} /></div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{s.label}</p>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "14px" }} className="max-lg:block max-lg:space-y-4">
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>매출 추이</h3>
          {loading ? <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}만`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad2)" dot={false} activeDot={{ r: 4, fill: "#C9A84C" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>직급 분포</h3>
          {rankDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={rankDist} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {rankDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v.toLocaleString()}명`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "8px" }}>
                {rankDist.map((r) => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{r.value.toLocaleString()}명</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>데이터 없음</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="max-lg:block max-lg:space-y-4">
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}><h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>상품별 매출 TOP 5</h3></div>
          {topProducts.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>주문 데이터 없음</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--bg-border)" }}>{["상품명","판매수","매출"].map(h => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: i === 0 ? "rgba(201,168,76,0.2)" : "var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: i === 0 ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }}>{i+1}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>{p.sales.toLocaleString()}개</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>{formatKRW(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}><h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 주문</h3></div>
          {recentOrders.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>주문 없음</div> : (
            recentOrders.map((o: any, i) => {
              const s = STATUS_MAP[o.status] ?? STATUS_MAP["PAID"];
              return (
                <div key={o.order_code} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderBottom: i < recentOrders.length-1 ? "1px solid var(--bg-border)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{(o.member as any)?.name ?? "—"}</p>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "monospace" }}>{o.order_code}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)" }}>{formatKRW(o.total_price)}</p>
                    <span style={{ padding: "2px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
