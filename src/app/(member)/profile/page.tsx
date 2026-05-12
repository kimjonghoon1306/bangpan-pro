"use client";

import { useState } from "react";
import { Save, User, CreditCard, Lock, Check, Eye, EyeOff, Bell, Shield } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const TABS = [
  { id: "info",     label: "기본 정보", icon: User },
  { id: "bank",     label: "계좌 정보", icon: CreditCard },
  { id: "password", label: "비밀번호",  icon: Lock },
];

const MEMBER = {
  name: "김민수", email: "kim@test.com", phone: "010-1234-5678",
  address: "", member_code: "M-012847", rank: "골드", rank_color: "#C9A84C",
  joined_at: "2023-03-15", sponsor: "이영희",
  bank_name: "국민은행", bank_account: "123-456-789012", bank_holder: "김민수",
};

export default function ProfilePage() {
  const [tab, setTab] = useState("info");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(MEMBER);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  async function handlePasswordChange() {
    setError("");
    if (!pw.current || !pw.next || !pw.confirm) { setError("모든 항목을 입력해주세요."); return; }
    if (pw.next !== pw.confirm) { setError("새 비밀번호가 일치하지 않습니다."); return; }
    if (pw.next.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    setPwLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw.next });
    setPwLoading(false);
    if (err) { setError(err.message); return; }
    setPw({ current: "", next: "", confirm: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">

      {/* 좌측 — 프로필 카드 + 탭 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* 프로필 카드 */}
        <div style={{ background: "var(--bg-elevated)", border: `1px solid ${MEMBER.rank_color}33`, borderRadius: "16px", padding: "20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.05 }} width="120" height="120" viewBox="0 0 120 120"><circle cx="90" cy="30" r="60" fill={MEMBER.rank_color} /></svg>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${MEMBER.rank_color}22`, border: `3px solid ${MEMBER.rank_color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: MEMBER.rank_color, margin: "0 auto 12px" }}>
            {form.name[0]}
          </div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>{form.name}</p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", marginBottom: "10px" }}>{MEMBER.member_code}</p>
          <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: `${MEMBER.rank_color}22`, color: MEMBER.rank_color, border: `1px solid ${MEMBER.rank_color}44` }}>{MEMBER.rank}</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
            <div style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>추천인</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{MEMBER.sponsor}</p>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>가입일</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{MEMBER.joined_at}</p>
            </div>
          </div>
        </div>

        {/* 탭 버튼 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", overflow: "hidden" }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSaved(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", background: tab === t.id ? "rgba(201,168,76,0.08)" : "transparent",
              borderLeft: tab === t.id ? "3px solid var(--gold)" : "3px solid transparent",
              border: "none", borderBottom: i < TABS.length-1 ? "1px solid var(--bg-border)" : "none",
              cursor: "pointer", color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "14px", fontWeight: tab === t.id ? 700 : 500, transition: "all 0.15s",
            }}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* 보안 상태 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Shield size={14} color="var(--emerald)" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>계정 보안</span>
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ flex: 1, height: "5px", borderRadius: "3px", background: i <= 3 ? "var(--gold)" : "var(--bg-border)" }} />
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>보안 수준: <span style={{ color: "var(--gold)", fontWeight: 600 }}>보통</span></p>
        </div>
      </div>

      {/* 우측 — 콘텐츠 */}
      <div>
        {(saved || error) && (
          <div style={{ marginBottom: "14px", padding: "12px 16px", borderRadius: "10px", background: saved ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${saved ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: saved ? "var(--emerald)" : "#F87171", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            {saved ? <><Check size={14} /> 저장되었습니다.</> : error}
          </div>
        )}

        {/* 모바일 탭 */}
        <div className="lg:hidden" style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "14px" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSaved(false); }} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "9px", borderRadius: "9px", fontSize: "12px", fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s",
              background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
              border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
              color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
            }}>
              <t.icon size={13} /><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>

          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>기본 정보</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                {[
                  { label: "이름", key: "name", type: "text", placeholder: "홍길동" },
                  { label: "전화번호", key: "phone", type: "tel", placeholder: "010-0000-0000" },
                  { label: "주소", key: "address", type: "text", placeholder: "주소를 입력하세요" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} className="input-base" style={{ fontSize: "14px" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>이메일 (변경불가)</label>
                  <input type="email" value={form.email} disabled className="input-base" style={{ fontSize: "14px", opacity: 0.6 }} />
                </div>
              </div>
              <button onClick={handleSave} className="btn-gold" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          )}

          {tab === "bank" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>계좌 정보</h3>
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", fontSize: "12px", color: "var(--text-muted)" }}>
                수당 지급 시 사용되는 계좌 정보입니다. 정확하게 입력해주세요.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>은행명</label>
                  <select value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} className="input-base" style={{ fontSize: "14px" }}>
                    {["국민은행","신한은행","우리은행","하나은행","농협","기업은행","카카오뱅크","토스뱅크"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {[
                  { label: "계좌번호", key: "bank_account", placeholder: "- 없이 입력" },
                  { label: "예금주", key: "bank_holder", placeholder: "예금주명" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                    <input type="text" value={(form as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} className="input-base" style={{ fontSize: "14px" }} />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="btn-gold" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          )}

          {tab === "password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>비밀번호 변경</h3>
              {[
                { label: "현재 비밀번호", key: "current", placeholder: "현재 비밀번호 입력" },
                { label: "새 비밀번호", key: "next", placeholder: "8자 이상 입력" },
                { label: "새 비밀번호 확인", key: "confirm", placeholder: "새 비밀번호 재입력" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={(showPw as any)[f.key] ? "text" : "password"}
                      value={(pw as any)[f.key]}
                      onChange={(e) => setPw(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="input-base"
                      style={{ fontSize: "14px", paddingRight: "40px" }}
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [f.key]: !(s as any)[f.key] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      {(showPw as any)[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handlePasswordChange} disabled={pwLoading} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {pwLoading
                  ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />변경 중...</>
                  : <><Lock size={15} /> 비밀번호 변경</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
