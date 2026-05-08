"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Search, Package } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";

const PRODUCTS = [
  { id: "1", name: "프리미엄 영양제 세트", price: 89000, member_price: 72000, pv: 80, category: "건강식품", stock: 248 },
  { id: "2", name: "콜라겐 음료 30포", price: 59000, member_price: 48000, pv: 50, category: "건강식품", stock: 512 },
  { id: "3", name: "비타민 C 1000mg", price: 39000, member_price: 32000, pv: 35, category: "건강식품", stock: 0 },
  { id: "4", name: "프로바이오틱스 플러스", price: 68000, member_price: 56000, pv: 60, category: "건강식품", stock: 180 },
];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const totalItems = Object.values(cart).reduce((s, n) => s + n, 0);

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  const filtered = PRODUCTS.filter((p) => !search || p.name.includes(search));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">쇼핑몰</h2>
          <p className="text-text-muted text-sm mt-0.5">회원 전용 할인가</p>
        </div>
        <button className="relative btn-outline flex items-center gap-2 text-sm">
          <ShoppingCart className="w-4 h-4" />
          장바구니
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-bg text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품 검색..." className="input-base pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="card hover:border-gold/20 transition-colors">
            <div className="w-full h-32 bg-bg-elevated rounded-lg flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="font-medium text-text-primary text-sm">{p.name}</h3>
            <p className="text-xs text-text-muted mt-0.5">{p.category}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xs text-text-muted line-through">{formatKRW(p.price)}</p>
                <p className="text-lg font-bold text-gold font-display">{formatKRW(p.member_price)}</p>
                <p className="text-[11px] text-text-muted">PV {p.pv}</p>
              </div>
              <button
                onClick={() => addToCart(p.id)}
                disabled={p.stock === 0}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  p.stock === 0
                    ? "bg-bg-elevated text-text-muted cursor-not-allowed"
                    : "btn-gold"
                )}
              >
                {p.stock === 0 ? "품절" : (
                  <><Plus className="w-3.5 h-3.5" />담기</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
