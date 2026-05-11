"use client";

import { useState } from "react";
import { Save, Building2, Calendar, Shield, CreditCard, Check, Plus, Trash2 } from "lucide-react";

const TABS = [
  { id: "company", label: "회사 정보", icon: Building2 },
  { id: "settlement", label: "정산 설정", icon: Calendar },
  { id: "rank", label: "직급 설정", icon: Shield },
  { id: "payment", label: "결제 설정", icon: CreditCard },
];

const INITIAL_RANKS = [
  { code: "RANK_01", name: "일반회원", level: 1, min_pv: 0,    min_gv: 0,     min_direct: 0,  color: "#6A6A8A" },
  { code: "RANK_02", name: "실버",    level: 2, min_pv: 200,  min_gv: 1000,  min_direct: 2,  color: "#94A3B8" },
  { code: "RANK_03", name: "골드",    level: 3, min_pv: 500,  min_gv: 5000,  min_direct: 5,  color: "#C9A84C" },
  { code: "RANK_04", name: "플래티넘", level: 4, min_pv: 1000, min_gv: 20000, min_direct: 10, color: "#818CF8" },
  { code: "RANK_05", name: "다이아",  level: 5, min_pv: 2000, min_gv: 80000, min_direct: 20, color: "#38BDF8" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("company");
  const [saved, setSaved] = useState(false);
  const [ranks, setRanks] = useState(INITIAL_RANKS);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateRank(idx: number, key: string, val: string | number) {
    setRanks(r => r.map((rank, i) => i === idx ? { ...rank, [key]: val } : rank));
  }

  function addRank() {
    const maxLevel = Math.max(...ranks.map(r => r.level));
    setRanks(r => [...r, {
      code: `RANK_0${maxLevel + 1}`,
      name: "새 직급",
      level: maxLevel + 1,
      min_pv: 0, min_gv: 0, min_direct: 0,
      color: "#C9A84C",
    }]);
  }

  function removeRank(idx: number) {
    setRanks(r => r.filter((_, i) => i !== idx));
  }

  return (
    <div style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>시스템 설정</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>회사 정보 및 운영 설정</p>
        </div>
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", fontSize: "13px" }}>
            <Check size={14} /> 저장완료
          </div>
        )}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "20px", flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 8px", borderRadius: "9px", fontSize: "13px",
            fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s",
            background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
            border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
            color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* 회사 정보 */}
        {tab === "company" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>기본 정보</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "회사명", placeholder: "주식회사 예시" },
                  { label: "대표자명", placeholder: "홍길동" },
                  { label: "사업자등록번호", placeholder: "000-00-00000" },
                  { label: "법인등록번호", placeholder: "000000-0000000" },
                  { label: "업태", placeholder: "방문판매" },
                  { label: "종목", placeholder: "건강식품" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>연락처 정보</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { label: "주소", placeholder: "서울시 강남구..." },
                    { label: "고객센터 전화", placeholder: "1588-0000" },
                    { label: "이메일", placeholder: "cs@company.com" },
                    { label: "홈페이지", placeholder: "https://company.com" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                      <input type="text" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>라이선스</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { label: "방문판매업 신고번호", placeholder: "제 0000-000호" },
                    { label: "다단계판매업 등록번호", placeholder: "미등록 시 공란" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                      <input type="text" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          </div>
        )}

        {/* 정산 설정 */}
        {tab === "settlement" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>정산 주기</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "정산 기준일", placeholder: "25", desc: "매월 몇 일에 마감" },
                  { label: "지급일", placeholder: "10", desc: "익월 몇 일에 지급" },
                  { label: "최소 지급액 (원)", placeholder: "10000", desc: "미달 시 다음 달 이월" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                    <input type="number" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>세금 설정</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "원천징수 세율 (%)", placeholder: "3.3", desc: "기본 3.3% (소득세 3% + 지방소득세 0.3%)" },
                  { label: "수당 지급 최대 단계", placeholder: "2", desc: "공유수당형은 2단계 권장" },
                  { label: "월 최대 수당 한도 (원, 0=무제한)", placeholder: "0", desc: "0 입력 시 무제한" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                    <input type="number" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          </div>
        )}

        {/* 직급 설정 */}
        {tab === "rank" && (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>직급 체계 설정</h3>
              <button onClick={addRank} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <Plus size={14} /> 직급 추가
              </button>
            </div>

            {/* PC 테이블 */}
            <div className="hidden md:block" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    {["색상", "직급명", "최소 개인PV", "최소 그룹GV", "직추천 최소", "레벨", ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((r, i) => (
                    <tr key={r.code} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input type="color" value={r.color} onChange={(e) => updateRank(i, "color", e.target.value)} style={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid var(--bg-border)", cursor: "pointer", background: "transparent" }} />
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, display: "inline-block" }} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input type="text" value={r.name} onChange={(e) => updateRank(i, "name", e.target.value)} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", minWidth: "100px" }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input type="number" value={r.min_pv} onChange={(e) => updateRank(i, "min_pv", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "100px" }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input type="number" value={r.min_gv} onChange={(e) => updateRank(i, "min_gv", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "100px" }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input type="number" value={r.min_direct} onChange={(e) => updateRank(i, "min_direct", Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "7px 10px", width: "80px" }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: r.color }}>{r.level}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {i > 0 && (
                          <button onClick={() => removeRank(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F87171"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {ranks.map((r, i) => (
                <div key={r.code} style={{ background: "var(--bg)", border: `1px solid ${r.color}33`, borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <input type="color" value={r.color} onChange={(e) => updateRank(i, "color", e.target.value)} style={{ width: 32, height: 32, borderRadius: "8px", border: "none", cursor: "pointer" }} />
                    <input type="text" value={r.name} onChange={(e) => updateRank(i, "name", e.target.value)} className="input-base" style={{ fontSize: "14px", fontWeight: 700 }} />
                    {i > 0 && <button onClick={() => removeRank(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#F87171", marginLeft: "auto" }}><Trash2 size={15} /></button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {[
                      { label: "최소 PV", key: "min_pv" },
                      { label: "최소 GV", key: "min_gv" },
                      { label: "직추천", key: "min_direct" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{f.label}</label>
                        <input type="number" value={(r as any)[f.key]} onChange={(e) => updateRank(i, f.key, Number(e.target.value))} className="input-base" style={{ fontSize: "13px", padding: "6px 8px" }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--bg-border)" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          </div>
        )}

        {/* 결제 설정 */}
        {tab === "payment" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>PG 설정</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>PG사 선택</label>
                  <select className="input-base" style={{ fontSize: "13px" }}>
                    {["토스페이먼츠", "KG이니시스", "나이스페이", "직접입금(무통장)"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {[
                  { label: "상점 ID", placeholder: "상점 ID 입력" },
                  { label: "API Key", placeholder: "API Key 입력", type: "password" },
                  { label: "Secret Key", placeholder: "Secret Key 입력", type: "password" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>무통장 계좌</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>은행</label>
                  <select className="input-base" style={{ fontSize: "13px" }}>
                    {["국민은행", "신한은행", "우리은행", "하나은행", "농협", "기업은행"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {[
                  { label: "계좌번호", placeholder: "- 없이 입력" },
                  { label: "예금주", placeholder: "예금주명" },
                  { label: "입금 확인 연락처", placeholder: "010-0000-0000" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="input-base" style={{ fontSize: "13px" }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Save size={15} /> 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
