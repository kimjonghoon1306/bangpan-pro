"use client";

import { useState } from "react";
import {
  Save, Building2, Calendar, Shield, CreditCard,
  Check, Plus, Trash2, Lock, Eye, EyeOff,
  TrendingUp, Users, Wallet, ShieldCheck, Key,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const TABS = [
  { id: "company",    label: "회사 정보", icon: Building2 },
  { id: "settlement", label: "정산 설정", icon: Calendar },
  { id: "rank",       label: "직급 설정", icon: Shield },
  { id: "payment",    label: "결제 설정", icon: CreditCard },
  { id: "password",   label: "비밀번호",  icon: Lock },
];

const INITIAL_RANKS = [
  { code: "RANK_01", name: "일반회원", level: 1, min_pv: 0,    min_gv: 0,     min_direct: 0,  color: "#6A6A8A" },
  { code: "RANK_02", name: "실버",    level: 2, min_pv: 200,  min_gv: 1000,  min_direct: 2,  color: "#94A3B8" },
  { code: "RANK_03", name: "골드",    level: 3, min_pv: 500,  min_gv: 5000,  min_direct: 5,  color: "#C9A84C" },
  { code: "RANK_04", name: "플래티넘", level: 4, min_pv: 1000, min_gv: 20000, min_direct: 10, color: "#818CF8" },
  { code: "RANK_05", name: "다이아",  level: 5, min_pv: 2000, min_gv: 80000, min_direct: 20, color: "#38BDF8" },
];

const SECURITY_TIPS = [
  { icon: Key, title: "강력한 비밀번호 사용", desc: "영문 대소문자, 숫자, 특수문자를 조합하여 12자 이상으로 설정하세요." },
  { icon: ShieldCheck, title: "정기적 변경 권장", desc: "3개월마다 비밀번호를 변경하면 보안을 강화할 수 있습니다." },
  { icon: Users, title: "공유 금지", desc: "관리자 비밀번호는 절대 타인과 공유하지 마세요." },
  { icon: TrendingUp, title: "로그인 기록 확인", desc: "정기적으로 로그인 기록을 확인하여 이상 접근을 감지하세요." },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("company");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [ranks, setRanks] = useState(INITIAL_RANKS);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function updateRank(idx: number, key: string, val: string | number) {
    setRanks(r => r.map((rank, i) => i === idx ? { ...rank, [key]: val } : rank));
  }
  function addRank() {
    const maxLevel = Math.max(...ranks.map(r => r.level));
    setRanks(r => [...r, { code: `RANK_0${maxLevel+1}`, name: "새 직급", level: maxLevel+1, min_pv: 0, min_gv: 0, min_direct: 0, color: "#C9A84C" }]);
  }
  function removeRank(idx: number) { setRanks(r => r.filter((_, i) => i !== idx)); }

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

  const inputStyle = { fontSize: "13px" } as React.CSSProperties;
  const labelStyle = { display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 } as React.CSSProperties;

  return (
    <div style={{ padding: "20px", minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>시스템 설정</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>회사 정보 및 운영 설정</p>
        </div>
        {(saved || error) && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: saved ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${saved ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: saved ? "var(--emerald)" : "#F87171", fontSize: "13px" }}>
            {saved ? <><Check size={14} /> 저장완료</> : error}
          </div>
        )}
      </div>

      {/* 탭 — 모바일 스크롤 */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "16px", flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSaved(false); }} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "9px 8px", borderRadius: "9px", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500,
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
            background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
            border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
            color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
          }}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1 }}>

        {/* 회사정보 */}
        {tab === "company" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>기본 정보</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["회사명","대표자명","사업자등록번호","법인등록번호","업태","종목"].map((label) => (
                  <div key={label}><label style={labelStyle}>{label}</label><input type="text" className="input-base" style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>연락처</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["주소","고객센터 전화","이메일","홈페이지"].map((label) => (
                    <div key={label}><label style={labelStyle}>{label}</label><input type="text" className="input-base" style={inputStyle} /></div>
                  ))}
                </div>
              </div>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>라이선스</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["방문판매업 신고번호","다단계판매업 등록번호"].map((label) => (
                    <div key={label}><label style={labelStyle}>{label}</label><input type="text" className="input-base" style={inputStyle} /></div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Save size={15} /> 저장</button>
            </div>
          </div>
        )}

        {/* 정산설정 */}
        {tab === "settlement" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>정산 주기</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "정산 기준일", placeholder: "25", desc: "매월 몇 일에 마감" },
                  { label: "지급일", placeholder: "10", desc: "익월 몇 일에 지급" },
                  { label: "최소 지급액 (원)", placeholder: "10000", desc: "미달 시 다음 달 이월" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="number" placeholder={f.placeholder} className="input-base" style={inputStyle} />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>세금 설정</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "원천징수 세율 (%)", placeholder: "3.3", desc: "기본 3.3%" },
                  { label: "수당 지급 최대 단계", placeholder: "2", desc: "공유수당형은 2단계 권장" },
                  { label: "월 최대 수당 한도 (0=무제한)", placeholder: "0", desc: "" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="number" placeholder={f.placeholder} className="input-base" style={inputStyle} />
                    {f.desc && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{f.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Save size={15} /> 저장</button>
            </div>
          </div>
        )}

        {/* 직급설정 */}
        {tab === "rank" && (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>직급 체계 설정</h3>
              <button onClick={addRank} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <Plus size={14} /> 직급 추가
              </button>
            </div>
            {/* PC 테이블 */}
            <div className="hidden md:block" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    {["색상","직급명","최소 개인PV","최소 그룹GV","직추천 최소","레벨",""].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((r, i) => (
                    <tr key={r.code} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input type="color" value={r.color} onChange={(e) => updateRank(i, "color", e.target.value)} style={{ width: 30, height: 30, borderRadius: "8px", border: "1px solid var(--bg-border)", cursor: "pointer" }} />
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px" }}><input type="text" value={r.name} onChange={(e) => updateRank(i, "name", e.target.value)} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", minWidth: "100px" }} /></td>
                      <td style={{ padding: "11px 16px" }}><input type="number" value={r.min_pv} onChange={(e) => updateRank(i, "min_pv", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "90px" }} /></td>
                      <td style={{ padding: "11px 16px" }}><input type="number" value={r.min_gv} onChange={(e) => updateRank(i, "min_gv", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "90px" }} /></td>
                      <td style={{ padding: "11px 16px" }}><input type="number" value={r.min_direct} onChange={(e) => updateRank(i, "min_direct", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "70px" }} /></td>
                      <td style={{ padding: "11px 16px" }}><span style={{ fontSize: "14px", fontWeight: 700, color: r.color }}>{r.level}</span></td>
                      <td style={{ padding: "11px 16px" }}>
                        {i > 0 && <button onClick={() => removeRank(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="#F87171"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--text-muted)"}><Trash2 size={15} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 모바일 카드 */}
            <div className="md:hidden" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {ranks.map((r, i) => (
                <div key={r.code} style={{ background: "var(--bg)", border: `1px solid ${r.color}44`, borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <input type="color" value={r.color} onChange={(e) => updateRank(i, "color", e.target.value)} style={{ width: 32, height: 32, borderRadius: "8px", border: "none", cursor: "pointer", flexShrink: 0 }} />
                    <input type="text" value={r.name} onChange={(e) => updateRank(i, "name", e.target.value)} className="input-base" style={{ fontSize: "14px", fontWeight: 600, flex: 1 }} />
                    {i > 0 && <button onClick={() => removeRank(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#F87171", flexShrink: 0 }}><Trash2 size={16} /></button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {[{label:"최소 PV",key:"min_pv"},{label:"최소 GV",key:"min_gv"},{label:"직추천",key:"min_direct"}].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{f.label}</label>
                        <input type="number" value={(r as any)[f.key]} onChange={(e) => updateRank(i, f.key, Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 8px" }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--bg-border)" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Save size={15} /> 저장</button>
            </div>
          </div>
        )}

        {/* 결제설정 */}
        {tab === "payment" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>PG 설정</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div><label style={labelStyle}>PG사 선택</label><select className="input-base" style={inputStyle}>{["토스페이먼츠","KG이니시스","나이스페이","직접입금(무통장)"].map(o=><option key={o}>{o}</option>)}</select></div>
                {[{label:"상점 ID",ph:"상점 ID"},{label:"API Key",ph:"API Key",pw:true},{label:"Secret Key",ph:"Secret Key",pw:true}].map(f=>(
                  <div key={f.label}><label style={labelStyle}>{f.label}</label><input type={f.pw?"password":"text"} placeholder={f.ph} className="input-base" style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>무통장 계좌</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div><label style={labelStyle}>은행</label><select className="input-base" style={inputStyle}>{["국민은행","신한은행","우리은행","하나은행","농협","기업은행"].map(b=><option key={b}>{b}</option>)}</select></div>
                {["계좌번호","예금주","입금 확인 연락처"].map(label=>(
                  <div key={label}><label style={labelStyle}>{label}</label><input type="text" className="input-base" style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Save size={15} /> 저장</button>
            </div>
          </div>
        )}

        {/* 비밀번호 — 좌우 2열 */}
        {tab === "password" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* 좌측 — 변경 폼 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={16} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>관리자 비밀번호 변경</h3>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>변경 후 다시 로그인이 필요합니다.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                {error && (
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: "13px" }}>{error}</div>
                )}
                <button onClick={handlePasswordChange} disabled={pwLoading} className="btn-gold" style={{ width: "100%", marginTop: "4px" }}>
                  {pwLoading
                    ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />변경 중...</>
                    : <><Lock size={15} /> 비밀번호 변경</>
                  }
                </button>
              </div>
            </div>

            {/* 우측 — 보안 팁 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 보안 수준 */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
                <svg style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.05 }} width="120" height="120" viewBox="0 0 120 120">
                  <path d="M60 10 L100 30 L100 70 Q100 100 60 110 Q20 100 20 70 L20 30 Z" fill="var(--gold)" />
                </svg>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <ShieldCheck size={20} color="var(--gold)" />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>보안 상태</span>
                </div>
                <div style={{ display: "flex", flex: 1, gap: "6px", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i <= 3 ? "var(--gold)" : "var(--bg-border)" }} />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>보안 수준: <span style={{ color: "var(--gold)", fontWeight: 600 }}>보통</span> — 더 강력한 비밀번호로 변경을 권장합니다.</p>
              </div>

              {/* 보안 팁 목록 */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>보안 가이드</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {SECURITY_TIPS.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <tip.icon size={15} color="var(--gold)" />
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{tip.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
