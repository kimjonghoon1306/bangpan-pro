"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, Phone, Mail, CreditCard,
  TrendingUp, Users, Wallet, ShoppingBag, Edit3,
  X, Check, Shield, Ban, RotateCcw, ExternalLink,
} from "lucide-react";

const DEMO: Record<string, any> = {
  "1": {
    id: "1", member_code: "M-012847", name: "김민수", email: "kim@test.com",
    phone: "010-1234-5678", rank: "골드", rank_level: 3,
    sponsor: "이영희", sponsor_code: "M-000012",
    personal_pv: 850, group_gv: 12400, left_volume: 6800, right_volume: 5600,
    bank_name: "국민은행", bank_account: "123-456-789012", bank_holder: "김민수",
    status: "ACTIVE", joined_at: "2023-03-15",
    this_month_commission: 247000, total_commission: 4820000,
    direct_referrals: 8, total_orders: 24, total_order_amount: 1840000,
  },
};

const RANKS = ["일반회원", "실버", "골드", "플래티넘", "다이아"];
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성", color: "var(--emerald)" },
  { value: "INACTIVE", label: "비활성", color: "var(--text-muted)" },
  { value: "SUSPENDED", label: "정지", color: "#F87171" },
];

const RANK_COLOR: Record<string, string> = {
  다이아: "#38BDF8", 플래티넘: "#A78BFA", 골드: "var(--gold)", 실버: "#94A3B8", 일반회원: "var(--text-muted)",
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<any>(DEMO["1"]);
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info"|"bank"|"org"|"history">("info");

  useEffect(() => { setForm({ ...member }); }, [member]);

  function update(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setMember(form);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleStatusChange(status: string) {
    setMember((m: any) => ({ ...m, status }));
  }

  if (!form) return null;

  const rankColor = RANK_COLOR[member.rank] || "var(--text-muted)";

  return (
    <div style={{ padding: "20px", maxWidth: "100%" }}>

      {/* ─── 헤더 ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{member.name}</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>{member.member_code}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => router.push(`/portal`)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 12px", borderRadius: "9px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            <ExternalLink size={13} /> 포털보기
          </button>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              <Edit3 size={13} /> 수정
            </button>
          ) : (
            <>
              <button onClick={() => { setEditing(false); setForm({ ...member }); }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 12px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px" }}>
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

      {/* ─── 프로필 카드 ─── */}
      <div style={{ background: "var(--bg-elevated)", border: `1px solid ${rankColor}33`, borderRadius: "16px", padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", right: -10, top: -10, opacity: 0.05 }} width="120" height="120" viewBox="0 0 120 120">
          <circle cx="90" cy="30" r="60" fill={rankColor} />
        </svg>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${rankColor}22`, border: `3px solid ${rankColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: rankColor, flexShrink: 0 }}>
          {member.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>{member.rank}</span>
            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: member.status === "ACTIVE" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: member.status === "ACTIVE" ? "var(--emerald)" : "#F87171" }}>
              {member.status === "ACTIVE" ? "활성" : member.status === "INACTIVE" ? "비활성" : "정지"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>추천인: {member.sponsor} ({member.sponsor_code}) · 가입: {member.joined_at}</p>
        </div>

        {/* 상태 변경 버튼 */}
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

      {/* ─── 실적 요약 ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px", marginBottom: "16px" }} className="md:grid-cols-4">
        {[
          { label: "개인 PV", value: member.personal_pv.toLocaleString(), icon: TrendingUp, color: "var(--gold)" },
          { label: "그룹 GV", value: member.group_gv.toLocaleString(), icon: Users, color: "#4F8EF7" },
          { label: "이달 수당", value: `₩${member.this_month_commission.toLocaleString()}`, icon: Wallet, color: "var(--emerald)" },
          { label: "총 주문액", value: `₩${member.total_order_amount.toLocaleString()}`, icon: ShoppingBag, color: "#A78BFA" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={16} color={s.color} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 탭 ─── */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "14px" }}>
        {[
          { key: "info", label: "기본정보" },
          { key: "bank", label: "계좌정보" },
          { key: "org", label: "조직/볼륨" },
          { key: "history", label: "수당내역" },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{
            flex: 1, padding: "8px", borderRadius: "9px", fontSize: "13px", fontWeight: activeTab === t.key ? 700 : 500, cursor: "pointer", transition: "all 0.15s",
            background: activeTab === t.key ? "rgba(201,168,76,0.1)" : "transparent",
            border: activeTab === t.key ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
            color: activeTab === t.key ? "var(--gold)" : "var(--text-secondary)",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 탭 콘텐츠 ─── */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>

        {/* 기본정보 */}
        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "이름", key: "name", type: "text", icon: User },
              { label: "이메일", key: "email", type: "email", icon: Mail },
              { label: "전화번호", key: "phone", type: "tel", icon: Phone },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
                {editing ? (
                  <div style={{ position: "relative" }}>
                    <f.icon size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input type={f.type} value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="input-base" style={{ paddingLeft: "34px", fontSize: "14px" }} />
                  </div>
                ) : (
                  <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500, padding: "2px 0" }}>{member[f.key] || "—"}</p>
                )}
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>직급</label>
              {editing ? (
                <select value={form.rank} onChange={(e) => update("rank", e.target.value)} className="input-base" style={{ fontSize: "14px" }}>
                  {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>{member.rank}</span>
              )}
            </div>
          </div>
        )}

        {/* 계좌정보 */}
        {activeTab === "bank" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", fontSize: "12px", color: "var(--text-muted)" }}>
              수당 지급 계좌 정보입니다. 정확하게 입력해주세요.
            </div>
            {[
              { label: "은행명", key: "bank_name" },
              { label: "계좌번호", key: "bank_account" },
              { label: "예금주", key: "bank_holder" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
                {editing ? (
                  <input type="text" value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="input-base" style={{ fontSize: "14px" }} />
                ) : (
                  <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{member[f.key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 조직/볼륨 */}
        {activeTab === "org" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>직접 추천</p>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>{member.direct_referrals}명</p>
              </div>
              <div style={{ padding: "14px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>누적 수당</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>₩{(member.total_commission / 10000).toFixed(0)}만</p>
              </div>
            </div>
            {[
              { side: "좌측 볼륨", vol: member.left_volume, color: "var(--gold)" },
              { side: "우측 볼륨", vol: member.right_volume, color: "#4F8EF7" },
            ].map((s) => (
              <div key={s.side}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.side}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{s.vol.toLocaleString()} GV</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.vol / Math.max(member.left_volume, member.right_volume)) * 100}%`, background: s.color, borderRadius: "4px", transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 수당내역 */}
        {activeTab === "history" && (
          <div>
            {[
              { date: "2024.07.01", desc: "직접추천수당 — 박지현", amount: 32000 },
              { date: "2024.07.01", desc: "직접추천수당 — 오민정", amount: 45000 },
              { date: "2024.07.01", desc: "간접수당 — 이준호 (2단계)", amount: 6000 },
              { date: "2024.06.30", desc: "직접추천수당 — 한상욱", amount: 45000 },
              { date: "2024.06.30", desc: "직급수당 — 골드 달성", amount: 50000 },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--bg-border)" : "none" }}>
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{c.desc}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{c.date}</p>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--gold)" }}>+{c.amount.toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ marginTop: "14px", padding: "12px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>이달 합계</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>₩{member.this_month_commission.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

