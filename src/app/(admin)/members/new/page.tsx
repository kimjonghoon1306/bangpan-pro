"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, User, Mail, Phone, Lock, Users, CreditCard, Check } from "lucide-react";

const RANKS = ["일반회원", "실버", "골드", "플래티넘", "다이아"];
const BANKS = ["국민은행","신한은행","우리은행","하나은행","농협","기업은행","카카오뱅크","토스뱅크"];

export default function NewMemberPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    sponsor_code: "", rank: "일반회원",
    bank_name: "국민은행", bank_account: "", bank_holder: "",
    memo: "",
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  }

  function validateStep1() {
    const e: Record<string,string> = {};
    if (!form.name) e.name = "이름을 입력해주세요";
    if (!form.email) e.email = "이메일을 입력해주세요";
    if (!form.phone) e.phone = "전화번호를 입력해주세요";
    if (!form.password) e.password = "비밀번호를 입력해주세요";
    if (form.password && form.password.length < 8) e.password = "8자 이상 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // TODO: API 호출
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ padding: "20px", maxWidth: "480px", margin: "0 auto", textAlign: "center", paddingTop: "60px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={30} color="var(--emerald)" />
        </div>
        <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>회원 등록 완료</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
          <strong style={{ color: "var(--text-primary)" }}>{form.name}</strong> 회원이 성공적으로 등록되었습니다.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={() => router.push("/members")} className="btn-outline" style={{ fontSize: "13px" }}>회원 목록</button>
          <button onClick={() => { setDone(false); setStep(1); setForm({ name:"",email:"",phone:"",password:"",sponsor_code:"",rank:"일반회원",bank_name:"국민은행",bank_account:"",bank_holder:"",memo:"" }); }} className="btn-gold" style={{ fontSize: "13px" }}>
            <UserPlus size={14} /> 추가 등록
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = { fontSize: "14px" } as React.CSSProperties;
  const labelStyle = { display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 } as React.CSSProperties;

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>회원 등록</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>관리자가 직접 회원을 추가합니다</p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "24px" }}>
        {[
          { num: 1, label: "기본 정보" },
          { num: 2, label: "추가 정보" },
          { num: 3, label: "확인" },
        ].map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700, transition: "all 0.2s",
                background: step > s.num ? "var(--emerald)" : step === s.num ? "var(--gold)" : "var(--bg-elevated)",
                color: step >= s.num ? "#08080E" : "var(--text-muted)",
                border: step >= s.num ? "none" : "1px solid var(--bg-border)",
              }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{ fontSize: "12px", fontWeight: step === s.num ? 700 : 500, color: step === s.num ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: "1px", background: step > s.num ? "var(--emerald)" : "var(--bg-border)", margin: "0 10px", transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      {/* 스텝 1 — 기본 정보 */}
      {step === 1 && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={16} color="var(--gold)" /> 기본 정보
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <div>
              <label style={labelStyle}>이름 *</label>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="홍길동" className="input-base" style={{ ...inputStyle, paddingLeft: "34px" }} />
              </div>
              {errors.name && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "3px" }}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>이메일 *</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@company.com" className="input-base" style={{ ...inputStyle, paddingLeft: "34px" }} />
              </div>
              {errors.email && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "3px" }}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>전화번호 *</label>
              <div style={{ position: "relative" }}>
                <Phone size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="010-0000-0000" className="input-base" style={{ ...inputStyle, paddingLeft: "34px" }} />
              </div>
              {errors.phone && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "3px" }}>{errors.phone}</p>}
            </div>
            <div>
              <label style={labelStyle}>초기 비밀번호 *</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="8자 이상" className="input-base" style={{ ...inputStyle, paddingLeft: "34px" }} />
              </div>
              {errors.password && <p style={{ fontSize: "11px", color: "#F87171", marginTop: "3px" }}>{errors.password}</p>}
            </div>
            <div>
              <label style={labelStyle}>추천인 코드</label>
              <div style={{ position: "relative" }}>
                <Users size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="text" value={form.sponsor_code} onChange={(e) => update("sponsor_code", e.target.value.toUpperCase())} placeholder="M-000000 (선택)" className="input-base" style={{ ...inputStyle, paddingLeft: "34px", fontFamily: "monospace" }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>초기 직급</label>
              <select value={form.rank} onChange={(e) => update("rank", e.target.value)} className="input-base" style={inputStyle}>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { if (validateStep1()) setStep(2); }} className="btn-gold" style={{ fontSize: "13px" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* 스텝 2 — 추가 정보 */}
      {step === 2 && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={16} color="var(--gold)" /> 계좌 및 메모
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <div>
              <label style={labelStyle}>은행</label>
              <select value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} className="input-base" style={inputStyle}>
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>계좌번호</label>
              <input type="text" value={form.bank_account} onChange={(e) => update("bank_account", e.target.value)} placeholder="- 없이 입력" className="input-base" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>예금주</label>
              <input type="text" value={form.bank_holder} onChange={(e) => update("bank_holder", e.target.value)} placeholder="예금주명" className="input-base" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>메모</label>
              <input type="text" value={form.memo} onChange={(e) => update("memo", e.target.value)} placeholder="관리자 메모 (선택)" className="input-base" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} className="btn-outline" style={{ fontSize: "13px" }}>← 이전</button>
            <button onClick={() => setStep(3)} className="btn-gold" style={{ fontSize: "13px" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* 스텝 3 — 확인 */}
      {step === 3 && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>등록 정보 확인</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "이름", value: form.name },
              { label: "이메일", value: form.email },
              { label: "전화번호", value: form.phone },
              { label: "추천인 코드", value: form.sponsor_code || "없음" },
              { label: "초기 직급", value: form.rank },
              { label: "은행", value: form.bank_account ? `${form.bank_name} ${form.bank_account} (${form.bank_holder})` : "미입력" },
            ].map((f) => (
              <div key={f.label} style={{ padding: "12px 14px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{f.label}</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{f.value}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
            등록 후 회원에게 이메일과 초기 비밀번호를 전달해주세요.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} className="btn-outline" style={{ fontSize: "13px" }}>← 이전</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-gold" style={{ fontSize: "13px" }}>
              {loading
                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />등록 중...</>
                : <><UserPlus size={14} /> 회원 등록 완료</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
