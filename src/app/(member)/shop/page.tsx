"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, X } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  member_price: number;
  pv: number;
  bv: number;
  category: string | null;
  stock: number;
  badge?: string | null;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.from("products").select("*").eq("status", "ACTIVE").order("created_at", { ascending: false });
      const list = (data as Product[]) ?? [];
      setProducts(list);
      const cats = Array.from(new Set(list.map(p => p.category).filter(Boolean) as string[]));
      setCategories(["전체", ...cats]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.includes(search);
    const matchCat = category === "전체" || p.category === category;
    return matchSearch && matchCat;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === id)!, qty })).filter(x => x.product);
  const cartTotal = cartItems.reduce((s, { product, qty }) => s + product.member_price * qty, 0);
  const cartPV = cartItems.reduce((s, { product, qty }) => s + product.pv * qty, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  function addCart(id: string) { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function removeCart(id: string) { setCart(c => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; }); }
  function deleteCart(id: string) { setCart(c => { const n = { ...c }; delete n[id]; return n; }); }

  async function handleOrder() {
    if (cartItems.length === 0) return;
    setOrdering(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setOrdering(false); return; }

    const now = new Date();
    const orderCode = `ORD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*999999)).padStart(6,"0")}`;

    const totalPrice = cartTotal;
    const totalPv = cartPV;
    const totalBv = cartItems.reduce((s, { product, qty }) => s + product.bv * qty, 0);

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      order_code: orderCode, member_id: session.user.id,
      total_price: totalPrice, total_pv: totalPv, total_bv: totalBv,
      status: "PENDING",
    }).select("id").single();

    if (!orderErr && order) {
      const items = cartItems.map(({ product, qty }) => ({
        order_id: order.id, product_id: product.id,
        product_name: product.name, quantity: qty,
        unit_price: product.member_price, unit_pv: product.pv, unit_bv: product.bv,
      }));
      await supabase.from("order_items").insert(items);
      setCart({});
      setShowCart(false);
      alert(`주문이 완료되었습니다!\n주문번호: ${orderCode}`);
    }
    setOrdering(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>쇼핑몰</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>회원 전용 할인가</p>
        </div>
        <button onClick={() => setShowCart(true)} style={{
          position: "relative", display: "flex", alignItems: "center", gap: "7px",
          padding: "8px 14px", borderRadius: "10px",
          background: cartCount > 0 ? "rgba(201,168,76,0.1)" : "var(--bg-elevated)",
          border: `1px solid ${cartCount > 0 ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
          color: cartCount > 0 ? "var(--gold)" : "var(--text-secondary)",
          cursor: "pointer", fontSize: "13px", fontWeight: 600,
        }}>
          <ShoppingCart size={16} />
          장바구니
          {cartCount > 0 && (
            <span style={{ background: "var(--gold)", color: "#000", borderRadius: "999px", fontSize: "11px", fontWeight: 800, padding: "1px 7px" }}>{cartCount}</span>
          )}
        </button>
      </div>

      {/* 검색 + 카테고리 */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 160px" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품 검색..." className="input-base" style={{ paddingLeft: "30px", fontSize: "13px", width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "7px 14px", borderRadius: "9px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
              background: category === c ? "rgba(201,168,76,0.15)" : "var(--bg-elevated)",
              border: `1px solid ${category === c ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
              color: category === c ? "var(--gold)" : "var(--text-secondary)",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>상품 불러오는 중...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {filtered.map((p) => {
            const qty = cart[p.id] || 0;
            const outOfStock = p.stock === 0;
            return (
              <div key={p.id} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
                borderRadius: "14px", overflow: "hidden",
                opacity: outOfStock ? 0.6 : 1,
              }}>
                {/* 상품 이미지 영역 */}
                <div style={{ height: "100px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", position: "relative" }}>
                  📦
                  {p.badge && (
                    <span style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(201,168,76,0.2)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>{p.badge}</span>
                  )}
                  {outOfStock && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>품절</div>
                  )}
                </div>
                <div style={{ padding: "10px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px", lineHeight: "1.3" }}>{p.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700, marginBottom: "2px" }}>{formatKRW(p.member_price)}</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", textDecoration: "line-through", marginBottom: "6px" }}>{formatKRW(p.price)}</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px" }}>PV {p.pv}</p>
                  {!outOfStock && (
                    qty === 0 ? (
                      <button onClick={() => addCart(p.id)} style={{
                        width: "100%", padding: "7px", borderRadius: "8px",
                        background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
                        color: "var(--gold)", cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      }}>담기</button>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(201,168,76,0.08)", borderRadius: "8px", padding: "4px 8px" }}>
                        <button onClick={() => removeCart(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold)", padding: "2px", display: "flex" }}><Minus size={14} /></button>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>{qty}</span>
                        <button onClick={() => addCart(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold)", padding: "2px", display: "flex" }}><Plus size={14} /></button>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 장바구니 오버레이 */}
      {showCart && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
          display: "flex", alignItems: "flex-end",
        }} onClick={() => setShowCart(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxHeight: "80vh", background: "var(--bg-surface)",
            borderRadius: "20px 20px 0 0", padding: "20px", overflow: "auto",
            maxWidth: "480px", margin: "0 auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>장바구니 ({cartCount})</h3>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            {cartItems.length === 0 ? (
              <p style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>장바구니가 비어있습니다</p>
            ) : (
              <>
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid var(--bg-border)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{product.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--gold)" }}>{formatKRW(product.member_price)} × {qty}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => removeCart(product.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><Minus size={14} /></button>
                      <span style={{ fontSize: "14px", fontWeight: 700, minWidth: "20px", textAlign: "center" }}>{qty}</span>
                      <button onClick={() => addCart(product.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><Plus size={14} /></button>
                      <button onClick={() => deleteCart(product.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#F87171", display: "flex" }}><X size={14} /></button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>합계</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--gold)" }}>{formatKRW(cartTotal)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "14px" }}>적립 PV: {cartPV}</div>
                  <button onClick={handleOrder} disabled={ordering} style={{
                    width: "100%", padding: "14px", borderRadius: "12px",
                    background: "var(--gold)", border: "none", color: "#000",
                    fontSize: "15px", fontWeight: 800, cursor: ordering ? "not-allowed" : "pointer",
                    opacity: ordering ? 0.7 : 1,
                  }}>{ordering ? "주문 처리 중..." : "주문하기"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
