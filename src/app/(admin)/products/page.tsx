"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit3, Trash2, Package, Check, X } from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface Product { id: string; code: string; name: string; description: string | null; category: string | null; price: number; member_price: number; pv: number; bv: number; stock: number; status: string; }

const EMPTY: Omit<Product, "id"> = { code: "", name: "", description: "", category: "", price: 0, member_price: 0, pv: 0, bv: 0, stock: 0, status: "ACTIVE" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [editId, setEditId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => !search || p.name.includes(search) || p.code.includes(search));

  function openAdd() { setForm(EMPTY); setModal("add"); }
  function openEdit(p: Product) { setForm({ code: p.code, name: p.name, description: p.description ?? "", category: p.category ?? "", price: p.price, member_price: p.member_price, pv: p.pv, bv: p.bv, stock: p.stock, status: p.status }); setEditId(p.id); setModal("edit"); }

  async function handleSave() {
    if (!form.name || !form.code) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    if (modal === "add") {
      await supabase.from("products").insert(form);
    } else {
      await supabase.from("products").update(form).eq("id", editId);
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  async function toggleStatus(p: Product) {
    const supabase = createBrowserSupabaseClient();
    await supabase.from("products").update({ status: p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }).eq("id", p.id);
    load();
  }

  const inputStyle = "input-base text-sm";
  const labelStyle = "block text-[11px] text-text-muted mb-1 font-semibold";

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">상품 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">전체 {products.length}개</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />상품 등록</button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품명, 코드 검색..." className="input-base pl-9 text-sm" />
      </div>

      <div className="card-elevated p-0 overflow-hidden">
        {loading ? <div className="p-8 text-center text-text-muted text-sm">불러오는 중...</div> : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>상품코드</th><th>상품명</th><th>소비자가</th><th>회원가</th><th>PV</th><th>BV</th><th>재고</th><th>상태</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="font-mono text-xs text-text-muted">{p.code}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-bg-border flex items-center justify-center flex-shrink-0"><Package className="w-3.5 h-3.5 text-text-muted" /></div>
                        <div><p className="text-sm font-medium text-text-primary">{p.name}</p><p className="text-[11px] text-text-muted">{p.category}</p></div>
                      </div>
                    </td>
                    <td className="text-sm text-text-secondary">{formatKRW(p.price)}</td>
                    <td className="text-sm font-medium text-gold">{formatKRW(p.member_price)}</td>
                    <td className="text-sm text-text-primary">{p.pv}</td>
                    <td className="text-sm text-text-secondary">{p.bv}</td>
                    <td><span className={cn("text-sm font-medium", p.stock === 0 ? "text-red-400" : "text-text-primary")}>{p.stock === 0 ? "품절" : p.stock.toLocaleString()}</span></td>
                    <td>
                      <button onClick={() => toggleStatus(p)} className={cn("badge text-[10px] cursor-pointer", p.status === "ACTIVE" ? "badge-green" : "badge-gray")}>
                        {p.status === "ACTIVE" ? "판매중" : "비활성"}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-gold rounded-lg hover:bg-bg-elevated transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-red-400 rounded-lg hover:bg-bg-elevated transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 등록/수정 모달 */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{modal === "add" ? "상품 등록" : "상품 수정"}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "상품코드", key: "code", type: "text" }, { label: "상품명", key: "name", type: "text" },
                { label: "카테고리", key: "category", type: "text" }, { label: "재고", key: "stock", type: "number" },
                { label: "소비자가", key: "price", type: "number" }, { label: "회원가", key: "member_price", type: "number" },
                { label: "PV", key: "pv", type: "number" }, { label: "BV", key: "bv", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className={labelStyle}>{label}</label>
                  <input type={type} className={inputStyle} value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px" }}>
              <label className={labelStyle}>설명</label>
              <textarea className={inputStyle} value={form.description ?? ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ width: "100%", resize: "none" }} />
            </div>
            <button onClick={handleSave} disabled={saving} style={{ marginTop: "16px", width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>
              {saving ? "저장 중..." : <><Check size={14} style={{ display: "inline", marginRight: "6px" }} />저장</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
