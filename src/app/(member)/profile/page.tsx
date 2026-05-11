"use client";

import { useState } from "react";
import { Save, User, CreditCard, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "info", label: "기본 정보", icon: User },
  { id: "bank", label: "계좌 정보", icon: CreditCard },
  { id: "password", label: "비밀번호", icon: Lock },
];

const MEMBER = {
  name: "김민수", email: "kim@test.com", phone: "010-1234-5678",
  address: "", member_code: "M-012847", rank: "골드",
  bank_name: "국민은행", bank_account: "123-456-789012", bank_holder: "김민수",
};

export default function ProfilePage() {
  const [tab, setTab] = useState("info");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(MEMBER);

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>내 정보</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>회원 정보 관리</p>
      </div>

      {/* 프로필 카드 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", right: -10, top: -10, opacity: 0.06, pointerEvents: "none" }} width="120" height="120" viewBox="0 0 120 120">
          <circle cx="90" cy="30" r="60" fill="var(--gold)" />
        </svg>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800, color: "var(--gold)", flexShrink: 0 }}>
          {form.name[0]}
        </div>
        <div>
          <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{form.name}</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "2px" }}>{form.member_code}</p>
          <span style={{ display: "inline-block", marginTop: "6px", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>{form.rank}</span>
        </div>
      </div>

      {saved && (
        <div style={{ marginBottom: "14px", padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <Check size={14} /> 저장되었습니다.
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "16px" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px", borderRadius: "9px", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s",
            background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
            border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
            color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
          }}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>

        {tab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "이름", key: "name", type: "text", placeholder: "홍길동" },
              { label: "이메일", key: "email", type: "email", placeholder: "email@company.com" },
              { label: "전화번호", key: "phone", type: "tel", placeholder: "010-0000-0000" },
              { label: "주소", key: "address", type: "text", placeholder: "주소를 입력하세요" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} className="input-base" style={{ fontSize: "14px" }} />
              </div>
            ))}
            <button onClick={handleSave} className="btn-gold" style={{ width: "100%", marginTop: "8px" }}>
              <Save size={15} /> 저장
            </button>
          </div>
        )}

        {tab === "bank" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", fontSize: "12px", color: "var(--text-muted)" }}>
              수당 지급 시 사용되는 계좌 정보입니다. 정확하게 입력해주세요.
            </div>
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
            <button onClick={handleSave} className="btn-gold" style={{ width: "100%", marginTop: "8px" }}>
              <Save size={15} /> 저장
            </button>
          </div>
        )}

        {tab === "password" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "현재 비밀번호", placeholder: "••••••••" },
              { label: "새 비밀번호", placeholder: "8자 이상" },
              { label: "새 비밀번호 확인", placeholder: "••••••••" },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                <input type="password" placeholder={f.placeholder} className="input-base" style={{ fontSize: "14px" }} />
              </div>
            ))}
            <button onClick={handleSave} className="btn-gold" style={{ width: "100%", marginTop: "8px" }}>
              <Lock size={15} /> 비밀번호 변경
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
