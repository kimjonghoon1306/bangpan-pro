"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Phone, Mail, CreditCard, TrendingUp, Users, Wallet, ShoppingBag, Edit3, X, Check, Shield, Ban, RotateCcw, ExternalLink, RefreshCw } from "lucide-react";
import { useMember } from "@/hooks/useMembers";
import { useOrders } from "@/hooks/useOrders";
import { formatKRW } from "@/lib/utils";

const RANKS = ["일반회원","실버","골드","플래티넘","다이아"];
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성", color: "var(--emerald)" },
  { value: "INACTIVE", label: "비활성", color: "var(--text-muted)" },
  { value: "SUSPENDED", label: "정지", color: "#F87171" },
];

const RANK_COLOR: Record<string, string> = {
  다이아: "#38BDF8", 플래티넘: "#A78BFA", 골드: "#C9A84C", 실버: "#94A3B8", 일반회원: "#444466",
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { member, loading, error, updateMember } = useMember(id as string);
  const { orders, loading: ordersLoading } = useOrders({ member_id: id as string });

  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info"|"bank"|"orders"|"history">("info");

  // form 초기화
  if (member && !form) setForm({ ...member });

  function update(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMember({
        name: form.name, phone: form.phone,
        bank_name: form.bank_name, bank_account: form.bank_account, bank_holder: form.bank_holder,
        status: form.status,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updateMember({ status });
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <RefreshCw size={24} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
    </div>
  );

  if (error || !member) return (
    <div style={{ padding: "20px" }}>
      <p style={{ color: "#F87171" }}>{error || "회원을 찾을 수 없습니다."}</p>
    </div>
  );

  const rankColor = RANK_COLOR[member.rank?.name ?? "일반회원"] || "#444466";
  const currentForm = form || member;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{member.name}</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>{member.member_code}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/portal")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 12px", borderRadius: "9px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            <ExternalLink size={13} /> 포털보기
          </button>
          {!editing ? (
            <button onClick={() => { setForm({...member}); setEditing(true); }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              <Edit3 size={13} /> 수정
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 12px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px" }}>
                <X size={13} /> 취소
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", fontSize: "12px" }}>
                {saving ? <span style={{ width: 13, height: 13, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                저장
              </button>
            </>
          )}
        </div>
      </div>

      {saved && (
        <div style={{ marginBottom: "14px", padding: "10px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <Check size={14} /> 저장완료
        </div>
      )}

      {/* 프로필 카드 */}
      <div style={{ background: "var(--bg-elevated)", border: `1px solid ${rankColor}33`, borderRadius: "16px", padding: "18px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.05 }} width="120" height="120" viewBox="0 0 120 120"><circle cx="90" cy="30" r="60" fill={rankColor} /></svg>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: `${rankColor}22`, border: `2px solid ${rankColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800, color: rankColor, flexShrink: 0 }}>
          {member.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>{member.rank?.name ?? "일반"}</span>
            <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: member.status === "ACTIVE" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: member.status === "ACTIVE" ? "var(--emerald)" : "#F87171" }}>
              {member.status === "ACTIVE" ? "활성" : member.status === "INACTIVE" ? "비활성" : "정지"}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>추천인: {member.sponsor?.name ?? "—"} · 가입: {member.joined_at?.slice(0,10)}</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {member.status !== "ACTIVE" && (
            <button onClick={() => handleStatusChange("ACTIVE")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              <RotateCcw size={12} /> 활성화
            </button>
          )}
          {member.status !== "SUSPENDED" && (
            <button onClick={() => handleStatusChange("SUSPENDED")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              <Ban size={12} /> 정지
            </button>
          )}
        </div>
      </div>

      {/* 실적 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px", marginBottom: "14px" }} className="md:grid-cols-4">
        {[
          { label: "개인 PV", value: member.personal_pv.toLocaleString(), icon: TrendingUp, color: "var(--gold)" },
          { label: "그룹 GV", value: member.group_gv.toLocaleString(), icon: Users, color: "#4F8EF7" },
          { label: "주문 건수", value: `${orders.length}건`, icon: ShoppingBag, color: "var(--emerald)" },
          { label: "총 주문액", value: formatKRW(orders.reduce((s,o) => s + o.total_price, 0)), icon: Wallet, color: "#A78BFA" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <s.icon size={15} color={s.color} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "12px", overflowX: "auto" }}>
        {[{key:"info",label:"기본정보"},{key:"bank",label:"계좌정보"},{key:"orders",label:"주문내역"},{key:"history",label:"볼륨"}].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{ flex: "0 0 auto", padding: "8px 16px", borderRadius: "9px", fontSize: "13px", fontWeight: activeTab === t.key ? 700 : 500, cursor: "pointer", transition: "all 0.15s", background: activeTab === t.key ? "rgba(201,168,76,0.1)" : "transparent", border: activeTab === t.key ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", color: activeTab === t.key ? "var(--gold)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>

        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[{label:"이름",key:"name",type:"text",icon:User},{label:"이메일",key:"email",type:"email",icon:Mail},{label:"전화번호",key:"phone",type:"tel",icon:Phone}].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600, textTransform: "uppercase" }}>{f.label}</label>
                {editing ? (
                  <div style={{ position: "relative" }}>
                    <f.icon size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input type={f.type} value={currentForm[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="input-base" style={{ paddingLeft: "34px", fontSize: "14px" }} />
                  </div>
                ) : (
                  <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{member[f.key as keyof typeof member] as string || "—"}</p>
                )}
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600, textTransform: "uppercase" }}>상태</label>
              {editing ? (
                <select value={currentForm.status} onChange={(e) => update("status", e.target.value)} className="input-base" style={{ fontSize: "14px" }}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : (
                <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: member.status === "ACTIVE" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: member.status === "ACTIVE" ? "var(--emerald)" : "#F87171" }}>
                  {STATUS_OPTIONS.find(s => s.value === member.status)?.label}
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "bank" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[{label:"은행명",key:"bank_name"},{label:"계좌번호",key:"bank_account"},{label:"예금주",key:"bank_holder"}].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600, textTransform: "uppercase" }}>{f.label}</label>
                {editing ? (
                  <input type="text" value={currentForm[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="input-base" style={{ fontSize: "14px" }} />
                ) : (
                  <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{member[f.key as keyof typeof member] as string || "—"}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}><RefreshCw size={18} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} /></div>
            ) : orders.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px" }}>주문 내역이 없습니다.</p>
            ) : orders.map((o, i) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < orders.length-1 ? "1px solid var(--bg-border)" : "none" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>{o.order_code}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{o.created_at?.slice(0,10)} · PV {o.total_pv}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>{formatKRW(o.total_price)}</p>
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "999px", background: o.status === "DELIVERED" ? "rgba(16,185,129,0.12)" : "var(--bg-border)", color: o.status === "DELIVERED" ? "var(--emerald)" : "var(--text-muted)" }}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[{side:"좌측 볼륨",vol:member.left_volume,color:"var(--gold)"},{side:"우측 볼륨",vol:member.right_volume,color:"#4F8EF7"}].map((s) => (
              <div key={s.side}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.side}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{s.vol.toLocaleString()} GV</span>
                </div>
                <div style={{ height: "7px", background: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(member.left_volume, member.right_volume) > 0 ? (s.vol / Math.max(member.left_volume, member.right_volume)) * 100 : 0}%`, background: s.color, borderRadius: "4px", transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: "8px", padding: "12px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>매칭 볼륨</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>
                {Math.min(member.left_volume, member.right_volume).toLocaleString()} GV
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
