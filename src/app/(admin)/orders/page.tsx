"use client";

import { useState } from "react";
import { Search, Download, Eye, MoreHorizontal, Package, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";

const ORDERS = [
  { id: "1", code: "ORD-20240701-000142", member: "김민수", member_code: "M-012847", items: 3, total_price: 248000, total_pv: 210, status: "DELIVERED", created_at: "2024.07.01", paid_at: "2024.07.01" },
  { id: "2", code: "ORD-20240701-000141", member: "박지현", member_code: "M-012846", items: 1, total_price: 89000, total_pv: 80, status: "SHIPPING", created_at: "2024.07.01", paid_at: "2024.07.01" },
  { id: "3", code: "ORD-20240630-000138", member: "오민정", member_code: "M-012842", items: 2, total_price: 178000, total_pv: 160, status: "PAID", created_at: "2024.06.30", paid_at: "2024.06.30" },
  { id: "4", code: "ORD-20240630-000135", member: "한상욱", member_code: "M-012843", items: 1, total_price: 59000, total_pv: 50, status: "PENDING", created_at: "2024.06.30", paid_at: "" },
  { id: "5", code: "ORD-20240629-000130", member: "이준호", member_code: "M-012845", items: 4, total_price: 392000, total_pv: 340, status: "DELIVERED", created_at: "2024.06.29", paid_at: "2024.06.29" },
  { id: "6", code: "ORD-20240629-000128", member: "강동현", member_code: "M-012841", items: 1, total_price: 45000, total_pv: 40, status: "CANCELLED", created_at: "2024.06.29", paid_at: "" },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "결제대기", cls: "badge-gold" },
  PAID: { label: "결제완료", cls: "text-blue-300 bg-blue-500/10 border border-blue-400/20" },
  SHIPPING: { label: "배송중", cls: "text-purple-300 bg-purple-500/10 border border-purple-400/20" },
  DELIVERED: { label: "배송완료", cls: "badge-green" },
  CANCELLED: { label: "취소", cls: "badge-red" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = ORDERS.filter((o) => {
    const matchSearch = !search || o.member.includes(search) || o.code.includes(search) || o.member_code.includes(search);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = ORDERS.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total_price, 0);
  const pendingCount = ORDERS.filter(o => o.status === "PENDING").length;
  const shippingCount = ORDERS.filter(o => o.status === "SHIPPING").length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">주문 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">전체 {ORDERS.length}건</p>
        </div>
        <button className="btn-outline flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" />
          엑셀 다운로드
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "이번달 매출", value: formatKRW(totalRevenue), icon: TrendingUp, color: "text-gold" },
          { label: "전체 주문", value: `${ORDERS.length}건`, icon: Package, color: "text-accent" },
          { label: "결제 대기", value: `${pendingCount}건`, icon: Clock, color: "text-gold" },
          { label: "배송중", value: `${shippingCount}건`, icon: CheckCircle, color: "text-emerald-soft" },
        ].map((s) => (
          <div key={s.label} className="card-elevated flex items-center gap-3">
            <s.icon className={cn("w-4 h-4 flex-shrink-0", s.color)} />
            <div>
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-sm font-bold text-text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="주문번호, 회원명 검색..." className="input-base pl-9 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                statusFilter === s ? "bg-gold/15 text-gold border-gold/25" : "bg-bg-elevated text-text-secondary border-bg-border hover:border-gold/20"
              )}
            >
              {s === "ALL" ? "전체" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="card-elevated p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>회원</th>
                <th>상품수</th>
                <th>금액</th>
                <th>PV</th>
                <th>주문일</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="group">
                  <td className="font-mono text-xs text-text-muted">{o.code}</td>
                  <td>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{o.member}</p>
                      <p className="text-[11px] text-text-muted font-mono">{o.member_code}</p>
                    </div>
                  </td>
                  <td className="text-sm text-text-secondary">{o.items}개</td>
                  <td className="text-sm font-medium text-text-primary">{formatKRW(o.total_price)}</td>
                  <td className="text-sm text-gold">{o.total_pv}</td>
                  <td className="text-xs text-text-muted">{o.created_at}</td>
                  <td>
                    <span className={cn("badge text-[10px]", STATUS_MAP[o.status]?.cls)}>
                      {STATUS_MAP[o.status]?.label}
                    </span>
                  </td>
                  <td>
                    <button className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
