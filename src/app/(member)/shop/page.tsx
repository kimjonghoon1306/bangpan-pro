"use client";

import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, X, Package, Tag, ChevronRight } from "lucide-react";
import { formatKRW } from "@/lib/utils";

const CATEGORIES = ["전체", "건강식품", "뷰티", "생활용품"];

const PRODUCTS = [
  { id: "1", name: "프리미엄 영양제 세트", category: "건강식품", price: 89000, member_price: 72000, pv: 80, bv: 75, stock: 248, badge: "베스트" },
  { id: "2", name: "콜라겐 음료 30포", category: "건강식품", price: 59000, member_price: 48000, pv: 50, bv: 45, stock: 512, badge: "신상" },
  { id: "3", name: "비타민 C 1000mg", category: "건강식품", price: 39000, member_price: 32000, pv: 35, bv: 30, stock: 0, badge: null },
  { id: "4", name: "프로바이오틱스 플러스", category: "건강식품", price: 68000, member_price: 56000, pv: 60, bv: 55, stock: 180, badge: null },
  { id: "5", name: "홍삼정 골드", category: "건강식품", price: 128000, member_price: 105000, pv: 110, bv: 100, stock: 64, badge: "추천" },
  { id: "6", name: "히알루론산 세럼", category: "뷰티", price: 45000, member_price: 38000, pv: 40, bv: 35, stock: 320, badge: "신상" },
];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = !search || p.name.includes(search);
    const matchCat = category === "전체" || p.category === category;
    return matchSearch && matchCat;
  });

  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    return s + (p ? p.member_price * qty : 0);
  }, 0);
  const cartPV = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    return s + (p ? p.pv * qty : 0);
  }, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  function addCart(id: string) { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function removeCart(id: string) { setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; }); }
  function deleteCart(id: string) { setCart(c => { const n = { ...c }; delete n[id]; return n; }); }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">

      {/* 좌측 — 상품 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>쇼핑몰</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>회원 전용 할인가</p>
          </div>
          {/* 모바일 장바구니 버튼 */}
          <button
            onClick={() => setShowCart(true)}
            className="lg:hidden"
            style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "10px", background: cartCount > 0 ? "rgba(201,168,76,0.1)" : "var(--bg-elevated)", border: `1px solid ${cartCount > 0 ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`, color: cartCount > 0 ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
          >
            <ShoppingCart size={16} />
            장바구니
            {cartCount > 0 && <span style={{ background: "var(--gold)", color: "#08080E", borderRadius: "999px", padding: "1px 7px", fontSize: "11px", fontWeight: 800 }}>{cartCount}</span>}
          </button>
        </div>

        {/* 검색 + 카테고리 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", background: category === c ? "rgba(201,168,76,0.15)" : "var(--bg-elevated)", border: `1px solid ${category === c ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`, color: category === c ? "var(--gold)" : "var(--text-secondary)" }}>{c}</button>
            ))}
          </div>
        </div>

        {/* 상품 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden", transition: "all 0.2s", position: "relative" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; }}
            >
              {p.badge && (
                <div style={{ position: "absolute", top: 10, left: 10, padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: p.badge === "베스트" ? "rgba(201,168,76,0.9)" : p.badge === "신상" ? "rgba(16,185,129,0.9)" : "rgba(79,142,247,0.9)", color: "#fff", zIndex: 1 }}>{p.badge}</div>
              )}
              {/* 상품 이미지 영역 */}
              <div style={{ height: "140px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={40} color="var(--bg-border)" />
              </div>
              <div style={{ padding: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.4 }}>{p.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>{p.category} · PV {p.pv}</p>
                <div style={{ marginBottom: "10px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "line-through" }}>{formatKRW(p.price)}</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>{formatKRW(p.member_price)}</p>
                </div>
                {p.stock === 0 ? (
                  <div style={{ padding: "9px", borderRadius: "9px", background: "var(--bg-border)", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>품절</div>
                ) : cart[p.id] ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "9px", padding: "4px 8px" }}>
                    <button onClick={() => removeCart(p.id)} style={{ width: 28, height: 28, borderRadius: "7px", background: "none", border: "none", cursor: "pointer", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--gold)" }}>{cart[p.id]}</span>
                    <button onClick={() => addCart(p.id)} style={{ width: 28, height: 28, borderRadius: "7px", background: "none", border: "none", cursor: "pointer", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => addCart(p.id)} style={{ width: "100%", padding: "9px", borderRadius: "9px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)"}
                  >
                    <Plus size={14} /> 담기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 — 장바구니 (PC) */}
      <div className="hidden lg:block" style={{ position: "sticky", top: "80px" }}>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={16} color="var(--gold)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>장바구니</h3>
            {cartCount > 0 && <span style={{ marginLeft: "auto", background: "rgba(201,168,76,0.15)", color: "var(--gold)", borderRadius: "999px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>{cartCount}개</span>}
          </div>

          {cartCount === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <ShoppingCart size={32} color="var(--bg-border)" style={{ marginBottom: "10px", display: "block", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>장바구니가 비어있습니다</p>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {Object.entries(cart).map(([id, qty]) => {
                  const p = PRODUCTS.find(p => p.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: "1px solid var(--bg-border)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        <p style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}>{formatKRW(p.member_price)} × {qty}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button onClick={() => removeCart(id)} style={{ width: 24, height: 24, borderRadius: "6px", background: "var(--bg)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Minus size={11} /></button>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", minWidth: "20px", textAlign: "center" }}>{qty}</span>
                        <button onClick={() => addCart(id)} style={{ width: 24, height: 24, borderRadius: "6px", background: "var(--bg)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Plus size={11} /></button>
                        <button onClick={() => deleteCart(id)} style={{ width: 24, height: 24, borderRadius: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", marginLeft: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>합계 PV</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{cartPV} PV</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>결제 금액</span>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>{formatKRW(cartTotal)}</span>
                </div>
                <button className="btn-gold" style={{ width: "100%", fontSize: "14px" }}>주문하기</button>
                <button onClick={() => setCart({})} style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "9px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)" }}>장바구니 비우기</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 모바일 장바구니 모달 */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} className="lg:hidden">
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "var(--bg-surface)", borderRadius: "20px 20px 0 0", padding: "20px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>장바구니 {cartCount > 0 && `(${cartCount})`}</h3>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            {cartCount === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px 0", fontSize: "14px" }}>장바구니가 비어있습니다</p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
                  {Object.entries(cart).map(([id, qty]) => {
                    const p = PRODUCTS.find(p => p.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--bg-border)" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</p>
                          <p style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700 }}>{formatKRW(p.member_price)}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button onClick={() => removeCart(id)} style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Minus size={13} /></button>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", minWidth: "24px", textAlign: "center" }}>{qty}</span>
                          <button onClick={() => addCart(id)} style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Plus size={13} /></button>
                          <button onClick={() => deleteCart(id)} style={{ width: 30, height: 30, borderRadius: "8px", background: "none", border: "none", cursor: "pointer", color: "#F87171", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>결제 금액</span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>{formatKRW(cartTotal)}</span>
                </div>
                <button className="btn-gold" style={{ width: "100%", fontSize: "15px", padding: "14px" }}>주문하기</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
