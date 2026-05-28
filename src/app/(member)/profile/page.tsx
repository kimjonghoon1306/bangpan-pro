"use client";

import { useState, useEffect } from "react";
import { Save, User, CreditCard, Lock, Check, Eye, EyeOff } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const TABS = [
  { id: "info",     label: "기본 정보", icon: User },
  { id: "bank",     label: "계좌 정보", icon: CreditCard },
  { id: "password", label: "비밀번호",  icon: Lock },
];

interface Form {
  name: string; email: string; phone: string;
  bank_name: string; bank_account: string; bank_holder: string;
  member_code: string; rank: string; rank_color: string;
  joined_at: string; sponsor: string;
}

export default function ProfilePage() {
  const [tab, setTab] = useState("info");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [form, setForm] = useState<Form>({
    name: "", email: "", phone: "",
    bank_name: "", bank_account: "", bank_holder: "",
    member_code: "", rank: "파트너", rank_color: "#C9A84C",
    joined_at: "", sponsor: "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setMemberId(session.user.id);

      const { data: m } = await supabase.from("members")
        .select("*, rank:ranks(name, color), sponsor:members!sponsor_id(name)")
        .eq("id", session.user.id).single();

      if (m) {
        setForm({
          name: m.name ?? "",
          email: m.email ?? session.user.email ?? "",
          phone: m.phone ?? "",
          bank_name: m.bank_name ?? "",
          bank_account: m.bank_account ?? "",
          bank_holder: m.bank_holder ?? "",
          member_code: (m as any).member_code ?? "",
          rank: (m as any).rank?.name ?? "파트너",
          rank_color: (m as any).rank?.color ?? "#C9A84C",
          joined_at: m.joined_at ?? "",
          sponsor: (m as any).sponsor?.name ?? "—",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave() {
    setSaving(true); setError("");
    const supabase = createBrowserSupabaseClient();
    const updates: any = { name: form.name, phone: form.phone, updated_at: new Date().toISOString() };
    if (tab === "bank") {
      updates.bank_name = form.bank_name;
      updates.bank_account = form.bank_account;
      updates.bank_holder = form.bank_holder;
    }
    const { error: err } = await supabase.from("members").update(updates).eq("id", memberId);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function handlePasswordChange() {
    setError("");
    if (!pw.next || !pw.confirm) { setError("새 비밀번호를 입력해주세요."); return; }
    if (pw.next !== pw.confirm) { setError("새 비밀번호가 일치하지 않습니다."); return; }
    if (pw.next.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    setPwLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw.next });
    setPwLoading(false);
    if (err) { setError(err.message); return; }
    setPw({ current: "", next: "", confirm: "" });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)", color: "var(--text-primary)", fontSize: "14px" };
  const labelStyle = { display: "block" as const, fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 as const };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--bg-border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* 프로필 카드 (모바일 상단 요약) */}
      <div style={{ background: "var(--bg-elevated)", border: `1px solid ${form.rank_color}33`, borderRadius: "16px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${form.rank_color}22`, border: `3px solid ${form.rank_color}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: 800, color: form.rank_color, flexShrink: 0,
        }}>{form.name?.[0] ?? "?"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{form.name}</p>
            <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: `${form.rank_color}22`, color: form.rank_color }}>{form.rank}</span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{form.member_code}</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>추천인: <strong style={{ color: "var(--text-secondary)" }}>{form.sponsor}</strong></span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>가입일: <strong style={{ color: "var(--text-secondary)" }}>{form.joined_at}</strong></span>
          </div>
        </div>
      </div>

      {/* 탭 + 폼 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        {/* 탭 버튼 */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--bg-border)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSaved(false); }} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "13px 8px", background: tab === t.id ? "rgba(201,168,76,0.08)" : "transparent",
              borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
              border: "none", cursor: "pointer",
              color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, transition: "all 0.15s",
            }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* 폼 내용 */}
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "info" && (
            <>
              <div><label style={labelStyle}>이름</label><input value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>이메일</label><input value={form.email} readOnly style={{ ...inputStyle, opacity: 0.5 }} /></div>
              <div><label style={labelStyle}>전화번호</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="010-0000-0000" style={inputStyle} /></div>
            </>
          )}
          {tab === "bank" && (
            <>
              <div><label style={labelStyle}>은행명</label><input value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} placeholder="국민은행" style={inputStyle} /></div>
              <div><label style={labelStyle}>계좌번호</label><input value={form.bank_account} onChange={(e) => update("bank_account", e.target.value)} placeholder="000-000-000000" style={inputStyle} /></div>
              <div><label style={labelStyle}>예금주</label><input value={form.bank_holder} onChange={(e) => update("bank_holder", e.target.value)} style={inputStyle} /></div>
            </>
          )}
          {tab === "password" && (
            <>
              {["next", "confirm"].map((key) => (
                <div key={key}>
                  <label style={labelStyle}>{key === "next" ? "새 비밀번호" : "새 비밀번호 확인"}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[key as keyof typeof showPw] ? "text" : "password"}
                      value={pw[key as keyof typeof pw]}
                      onChange={(e) => setPw(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="8자 이상"
                      style={{ ...inputStyle, paddingRight: "40px" }}
                    />
                    <button onClick={() => setShowPw(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      {showPw[key as keyof typeof showPw] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {error && <p style={{ fontSize: "12px", color: "#F87171" }}>{error}</p>}

          <button
            onClick={tab === "password" ? handlePasswordChange : handleSave}
            disabled={saving || pwLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "13px", borderRadius: "12px",
              background: saved ? "rgba(16,185,129,0.15)" : "rgba(201,168,76,0.15)",
              border: `1px solid ${saved ? "rgba(16,185,129,0.3)" : "rgba(201,168,76,0.3)"}`,
              color: saved ? "var(--emerald)" : "var(--gold)",
              cursor: "pointer", fontSize: "14px", fontWeight: 700,
              opacity: (saving || pwLoading) ? 0.7 : 1,
            }}
          >
            {saved ? <><Check size={15} /> 저장 완료</> : <><Save size={15} /> {saving || pwLoading ? "저장 중..." : "저장"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
