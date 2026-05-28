"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User, CreditCard, TrendingUp, Users, Wallet, ShoppingBag, Check, Shield, Ban, RotateCcw, RefreshCw } from "lucide-react";
import { useMember } from "@/hooks/useMembers";
import { useOrders } from "@/hooks/useOrders";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "ACTIVE",    label: "활성",   color: "var(--emerald)" },
  { value: "INACTIVE",  label: "비활성", color: "var(--text-muted)" },
  { value: "SUSPENDED", label: "정지",   color: "#F87171" },
];

const BANKS = ["국민은행","신한은행","우리은행","하나은행","농협","기업은행","카카오뱅크","토스뱅크"];

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { member, loading, error, updateMember } = useMember(id);
  const { orders, loading: ordersLoading } = useOrders({ member_id: id });
  const [ranks, setRanks] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", bank_name: "", bank_account: "", bank_holder: "", rank_id: "", status: "ACTIVE" });

  useEffect(() => {
    async function loadRanks() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.from("ranks").select("id, name, color").order("level");
      setRanks(data ?? []);
    }
    loadRanks();
  }, []);

  useEffect(() => {
    if (member) {
      setForm({ name: member.name, phone: member.phone ?? "", bank_name: member.bank_name ?? "", bank_account: member.bank_account ?? "", bank_holder: member.bank_holder ?? "", rank_id: member.rank_id ?? "", status: member.status });
    }
  }, [member]);

  async function handleSave() {
    await updateMember({ name: form.name, phone: form.phone || null, bank_name: form.bank_name || null, bank_account: form.bank_account || null, bank_holder: form.bank_holder || null, rank_id: form.rank_id || null, status: form.status } as any);
    setSaved(true); setTimeout(() => { setSaved(false); setEditing(false); }, 1500);
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>불러오는 중...</div>;
  if (error || !member) return <div style={{ padding: "40px", textAlign: "center", color: "#F87171" }}>회원을 찾을 수 없습니다</div>;

  const rankColor = member.rank?.color ?? "#444466";
  const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total_price, 0);
  const labelStyle = { display: "block" as const, fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 as const };

  return (
    <div style={{ padding: "20px", maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer" }}><ArrowLeft size={16} /></button>
          <div>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>회원 상세</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>{member.member_code}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{ padding: "8px 14px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>취소</button>
              <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "9px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--emerald)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                {saved ? <><Check size={14} />저장완료</> : <><Save size={14} />저장</>}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "9px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "var(--gold)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>수정</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">
        {/* 좌측 프로필 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "var(--bg-elevated)", border: `1px solid ${rankColor}33`, borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${rankColor}22`, border: `3px solid ${rankColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: rankColor, margin: "0 auto 12px" }}>{member.name[0]}</div>
            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>{member.name}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", marginBottom: "10px" }}>{member.member_code}</p>
            <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>{member.rank?.name ?? "파트너"}</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
              {[
                { label: "개인 PV", value: member.personal_pv },
                { label: "그룹 GV", value: member.group_gv.toLocaleString() },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px" }}>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>{s.label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>상태 관리</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {STATUS_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => editing && setForm(f => ({ ...f, status: s.value }))} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "9px", background: form.status === s.value ? `${s.color}15` : "transparent", border: `1px solid ${form.status === s.value ? s.color + "44" : "var(--bg-border)"}`, cursor: editing ? "pointer" : "default", transition: "all 0.15s" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: form.status === s.value ? 600 : 400, color: form.status === s.value ? s.color : "var(--text-secondary)" }}>{s.label}</span>
                  {form.status === s.value && <Check size={12} color={s.color} style={{ marginLeft: "auto" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 상세 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 실적 요약 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {[
              { label: "총 주문액", value: formatKRW(totalRevenue), icon: ShoppingBag, color: "#4F8EF7" },
              { label: "직접 추천", value: "—", icon: Users, color: "var(--gold)" },
              { label: "가입일", value: member.joined_at, icon: TrendingUp, color: "var(--emerald)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <s.icon size={16} color={s.color} />
                <div><p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.label}</p><p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p></div>
              </div>
            ))}
          </div>

          {/* 정보 편집 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>기본 정보</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div><label style={labelStyle}>이름</label><input className="input-base" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} style={{ fontSize: "13px" }} /></div>
              <div><label style={labelStyle}>이메일</label><input className="input-base" value={member.email} disabled style={{ fontSize: "13px", opacity: 0.5 }} /></div>
              <div><label style={labelStyle}>전화번호</label><input className="input-base" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} style={{ fontSize: "13px" }} /></div>
              <div>
                <label style={labelStyle}>직급</label>
                <select className="input-base" value={form.rank_id} onChange={(e) => setForm(f => ({ ...f, rank_id: e.target.value }))} disabled={!editing} style={{ fontSize: "13px" }}>
                  {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>추천인</label><input className="input-base" value={member.sponsor?.name ?? "없음"} disabled style={{ fontSize: "13px", opacity: 0.5 }} /></div>
            </div>
          </div>

          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>계좌 정보</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              <div>
                <label style={labelStyle}>은행</label>
                {editing ? (
                  <select className="input-base" value={form.bank_name} onChange={(e) => setForm(f => ({ ...f, bank_name: e.target.value }))} style={{ fontSize: "13px" }}>
                    <option value="">선택</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : <input className="input-base" value={form.bank_name} disabled style={{ fontSize: "13px", opacity: 0.5 }} />}
              </div>
              <div><label style={labelStyle}>계좌번호</label><input className="input-base" value={form.bank_account} onChange={(e) => setForm(f => ({ ...f, bank_account: e.target.value }))} disabled={!editing} style={{ fontSize: "13px" }} /></div>
              <div><label style={labelStyle}>예금주</label><input className="input-base" value={form.bank_holder} onChange={(e) => setForm(f => ({ ...f, bank_holder: e.target.value }))} disabled={!editing} style={{ fontSize: "13px" }} /></div>
            </div>
          </div>

          {/* 주문 내역 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>주문 내역</h3>
            </div>
            {ordersLoading ? <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
              : orders.length === 0 ? <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>주문 내역 없음</div>
              : orders.slice(0, 5).map((o, i) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderBottom: i < orders.length - 1 ? "1px solid var(--bg-border)" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>{o.order_code}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)" }}>{formatKRW(o.total_price)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
