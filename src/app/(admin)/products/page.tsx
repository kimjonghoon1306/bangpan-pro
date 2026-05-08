"use client";

import { useState } from "react";
import { Search, Plus, Edit3, Trash2, Package, ToggleLeft, ToggleRight } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";

const PRODUCTS = [
  { id: "1", code: "PRD-001", name: "프리미엄 영양제 세트", category: "건강식품", price: 89000, member_price: 72000, pv: 80, bv: 75, stock: 248, status: "ACTIVE" },
  { id: "2", code: "PRD-002", name: "콜라겐 음료 30포", category: "건강식품", price: 59000, member_price: 48000, pv: 50, bv: 45, stock: 512, status: "ACTIVE" },
  { id: "3", code: "PRD-003", name: "비타민 C 1000mg", category: "건강식품", price: 39000, member_price: 32000, pv: 35, bv: 30, stock: 0, status: "ACTIVE" },
  { id: "4", code: "PRD-004", name: "프로바이오틱스 플러스", category: "건강식품", price: 68000, member_price: 56000, pv: 60, bv: 55, stock: 180, status: "ACTIVE" },
  { id: "5", code: "PRD-005", name: "홍삼정 골드", category: "건강식품", price: 128000, member_price: 105000, pv: 110, bv: 100, stock: 64, status: "INACTIVE" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter(p => !search || p.name.includes(search) || p.code.includes(search));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">상품 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">전체 {PRODUCTS.length}개</p>
        </div>
        <button className="btn-gold flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          상품 등록
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품명, 코드 검색..." className="input-base pl-9 text-sm" />
      </div>

      <div className="card-elevated p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>상품코드</th>
                <th>상품명</th>
                <th>소비자가</th>
                <th>회원가</th>
                <th>PV</th>
                <th>BV</th>
                <th>재고</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="group">
                  <td className="font-mono text-xs text-text-muted">{p.code}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-bg-border flex items-center justify-center flex-shrink-0">
                        <Package className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{p.name}</p>
                        <p className="text-[11px] text-text-muted">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-text-secondary">{formatKRW(p.price)}</td>
                  <td className="text-sm font-medium text-gold">{formatKRW(p.member_price)}</td>
                  <td className="text-sm text-text-primary">{p.pv}</td>
                  <td className="text-sm text-text-secondary">{p.bv}</td>
                  <td>
                    <span className={cn("text-sm font-medium", p.stock === 0 ? "text-red-400" : "text-text-primary")}>
                      {p.stock === 0 ? "품절" : p.stock.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={cn("badge text-[10px]", p.status === "ACTIVE" ? "badge-green" : "badge-gray")}>
                      {p.status === "ACTIVE" ? "판매중" : "비활성"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-gold rounded-lg hover:bg-bg-elevated transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-red-400 rounded-lg hover:bg-bg-elevated transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
