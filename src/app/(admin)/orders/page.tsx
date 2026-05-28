"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, Eye, Package, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "결제대기", cls: "badge-gold" },
  PAID:      { label: "결제완료", cls: "text-blue-300 bg-blue-500/10 border border-blue-400/20" },
  SHIPPING:  { label: "배송중",   cls: "text-purple-300 bg-purple-500/10 border border-purple-400/20" },
  DELIVERED: { label: "배송완료", cls: "badge-green" },
  CANCELLED: { label: "취소",     cls: "badge-red" },
};

interface Order {
  id: string;
  order_code: string;
  total_price: number;
  total_pv: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  member: { name: string; member_code: string } | null;
  item_count?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    let query = supabase
      .from("orders")
      .select("id, order_code, total_price, total_pv, status, created_at, paid_at, member:members(name, member_code)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100);
    if (statusFilter !== "ALL") query = query.eq("status", statusFilter);
    if (search) query = query.or(`order_code.ilike.%${search}%`);
    const { data, count } = await query;
    setOrders((data as any) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    if (!search) return true;
    return o.order_code.includes(search) || (o.member as any)?.name?.includes(search) || (o.member as any)?.member_code?.includes(search);
  });

  const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total_price, 0);
  const pendingCount = orders.filter(o => o.status === "PENDING").length;
  const shippingCount = orders.filter(o => o.status === "SHIPPING").length;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

  async function updateStatus(id: string, status: string) {
    const supabase = createBrowserSupabaseClient();
    await supabase.from("orders").update({ status, ...(status === "PAID" ? { paid_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">주문 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">전체 {total}건</p>
        </div>
        <button className="btn-outline flex items-center gap-2 text-sm"><Download className="w-4 h-4" />엑셀 다운로드</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "이번달 매출", value: formatKRW(totalRevenue), icon: TrendingUp, color: "text-gold" },
          { label: "전체 주문",   value: `${total}건`,             icon: Package,   color: "text-accent" },
          { label: "결제 대기",   value: `${pendingCount}건`,      icon: Clock,     color: "text-gold" },
          { label: "배송중",      value: `${shippingCount}건`,     icon: CheckCircle, color: "text-emerald-soft" },
        ].map((s) => (
          <div key={s.label} className="card-elevated flex items-center gap-3">
            <s.icon className={cn("w-4 h-4 flex-shrink-0", s.color)} />
            <div><p className="text-xs text-text-muted">{s.label}</p><p className="text-sm font-bold text-text-primary">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="주문번호, 회원명 검색..." className="input-base pl-9 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all border", statusFilter === s ? "bg-gold/15 text-gold border-gold/25" : "bg-bg-elevated text-text-secondary border-bg-border hover:border-gold/20")}>
              {s === "ALL" ? "전체" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card-elevated p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted text-sm">불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>주문번호</th><th>회원</th><th>금액</th><th>PV</th><th>주문일</th><th>상태</th><th>처리</th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="group">
                    <td className="font-mono text-xs text-text-muted">{o.order_code}</td>
                    <td>
                      <p className="text-sm font-medium text-text-primary">{(o.member as any)?.name ?? "—"}</p>
                      <p className="text-[11px] text-text-muted font-mono">{(o.member as any)?.member_code}</p>
                    </td>
                    <td className="text-sm font-medium text-text-primary">{formatKRW(o.total_price)}</td>
                    <td className="text-sm text-gold">{o.total_pv}</td>
                    <td className="text-xs text-text-muted">{formatDate(o.created_at)}</td>
                    <td><span className={cn("badge text-[10px]", STATUS_MAP[o.status]?.cls)}>{STATUS_MAP[o.status]?.label}</span></td>
                    <td>
                      {o.status === "PENDING" && (
                        <button onClick={() => updateStatus(o.id, "PAID")} className="text-xs text-gold hover:underline px-2">결제확인</button>
                      )}
                      {o.status === "PAID" && (
                        <button onClick={() => updateStatus(o.id, "SHIPPING")} className="text-xs text-purple-300 hover:underline px-2">배송처리</button>
                      )}
                      {o.status === "SHIPPING" && (
                        <button onClick={() => updateStatus(o.id, "DELIVERED")} className="text-xs text-emerald-400 hover:underline px-2">배송완료</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
