"use client";

import { useState, useEffect } from "react";
import { Save, Building2, Calendar, Shield, CreditCard, Check, Plus, Trash2, Lock, Eye, EyeOff, Key, ShieldCheck, Users, TrendingUp } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const TABS = [
  { id: "company",    label: "회사 정보", icon: Building2 },
  { id: "settlement", label: "정산 설정", icon: Calendar },
  { id: "rank",       label: "직급 설정", icon: Shield },
  { id: "password",   label: "비밀번호",  icon: Lock },
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ranks, setRanks] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const [{ data: rankData }, { data: settingData }] = await Promise.all([
        supabase.from("ranks").select("*").order("level"),
        supabase.from("system_settings").select("key, value"),
      ]);
      setRanks(rankData ?? []);
      const map: Record<string, string> = {};
      (settingData ?? []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  function setSetting(key: string, val: string) { setSettings(s => ({ ...s, [key]: val })); }
  function updateRank(idx: number, key: string, val: any) { setRanks(r => r.map((rank, i) => i === idx ? { ...rank, [key]: val } : rank)); }
  function addRank() { const maxLevel = Math.max(...ranks.map(r => r.level), 0); setRanks(r => [...r, { id: null, code: `RANK_0${maxLevel+1}`, name: "새 직급", level: maxLevel+1, min_pv: 0, min_gv: 0, min_direct_referral: 0, color: "#C9A84C" }]); }
  function removeRank(idx: number) { setRanks(r => r.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setSaving(true); setError("");
    const supabase = createBrowserSupabaseClient();
    try {
      if (tab === "rank") {
        for (const rank of ranks) {
          if (rank.id) {
            await supabase.from("ranks").update({ code: rank.code, name: rank.name, level: rank.level, min_pv: rank.min_pv, min_gv: rank.min_gv, min_direct_referral: rank.min_direct_referral, color: rank.color }).eq("id", rank.id);
          } else {
            await supabase.from("ranks").insert({ code: rank.code, name: rank.name, level: rank.level, min_pv: rank.min_pv, min_gv: rank.min_gv, min_direct_referral: rank.min_direct_referral, color: rank.color });
          }
        }
      } else {
        const keys = tab === "company" ? ["company_name"] : ["settlement_day", "payout_day", "tax_rate", "min_payout", "sponsor_depth_limit"];
        for (const key of keys) {
          if (settings[key] !== undefined) {
            await supabase.from("system_settings").upsert({ key, value: settings[key], updated_at: new Date().toISOString() }, { onConflict: "key" });
          }
        }
      }
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
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

  const inputStyle = { fontSize: "13px" } as React.CSSProperties;
  const labelStyle = { display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 } as React.CSSProperties;

  return (
    <div style={{ padding: "20px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
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

      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", marginBottom: "16px", flexShrink: 0, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSaved(false); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 8px", borderRadius: "9px", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent", border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", color: tab === t.id ? "var(--gold)" : "var(--text-secondary)" }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div> : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "company" && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>회사 기본 정보</h3>
              <div><label style={labelStyle}>회사명</label><input className="input-base" style={inputStyle} value={settings.company_name ?? ""} onChange={(e) => setSetting("company_name", e.target.value)} /></div>
            </div>
          )}

          {tab === "settlement" && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>정산 설정</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div><label style={labelStyle}>정산 기준일</label><input type="number" className="input-base" style={inputStyle} value={settings.settlement_day ?? "25"} onChange={(e) => setSetting("settlement_day", e.target.value)} min={1} max={31} /></div>
                <div><label style={labelStyle}>지급일</label><input type="number" className="input-base" style={inputStyle} value={settings.payout_day ?? "10"} onChange={(e) => setSetting("payout_day", e.target.value)} min={1} max={31} /></div>
                <div><label style={labelStyle}>원천징수 세율 (%)</label><input type="number" className="input-base" style={inputStyle} value={parseFloat(settings.tax_rate ?? "0.033") * 100} onChange={(e) => setSetting("tax_rate", String(parseFloat(e.target.value) / 100))} step={0.1} /></div>
                <div><label style={labelStyle}>최소 지급액 (원)</label><input type="number" className="input-base" style={inputStyle} value={settings.min_payout ?? "10000"} onChange={(e) => setSetting("min_payout", e.target.value)} /></div>
                <div><label style={labelStyle}>수당 지급 최대 단계</label><input type="number" className="input-base" style={inputStyle} value={settings.sponsor_depth_limit ?? "2"} onChange={(e) => setSetting("sponsor_depth_limit", e.target.value)} min={1} /></div>
              </div>
            </div>
          )}

          {tab === "rank" && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--bg-border)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>직급 설정 ({ranks.length}개)</h3>
                <button onClick={addRank} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}><Plus size={13} /> 직급 추가</button>
              </div>
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {ranks.map((rank, idx) => (
                  <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "10px" }}>
                      <div><label style={labelStyle}>직급명</label><input className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.name} onChange={(e) => updateRank(idx, "name", e.target.value)} /></div>
                      <div><label style={labelStyle}>코드</label><input className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.code} onChange={(e) => updateRank(idx, "code", e.target.value)} /></div>
                      <div><label style={labelStyle}>레벨</label><input type="number" className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.level} onChange={(e) => updateRank(idx, "level", Number(e.target.value))} min={1} /></div>
                      <div><label style={labelStyle}>최소 PV</label><input type="number" className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.min_pv} onChange={(e) => updateRank(idx, "min_pv", Number(e.target.value))} /></div>
                      <div><label style={labelStyle}>최소 GV</label><input type="number" className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.min_gv} onChange={(e) => updateRank(idx, "min_gv", Number(e.target.value))} /></div>
                      <div><label style={labelStyle}>최소 직추천</label><input type="number" className="input-base" style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={rank.min_direct_referral} onChange={(e) => updateRank(idx, "min_direct_referral", Number(e.target.value))} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>색상</label>
                        <input type="color" value={rank.color} onChange={(e) => updateRank(idx, "color", e.target.value)} style={{ width: 32, height: 28, border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }} />
                        <span style={{ fontSize: "12px", color: rank.color, fontWeight: 600 }}>{rank.name}</span>
                      </div>
                      <button onClick={() => removeRank(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F87171"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}><Trash2 size={13} /> 삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "password" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }} className="max-md:block max-md:space-y-4">
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>비밀번호 변경</h3>
                {["next", "confirm"].map((key) => (
                  <div key={key}>
                    <label style={labelStyle}>{key === "next" ? "새 비밀번호" : "새 비밀번호 확인"}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPw[key as keyof typeof showPw] ? "text" : "password"} className="input-base" style={{ ...inputStyle, paddingRight: "40px" }} value={pw[key as keyof typeof pw]} onChange={(e) => setPw(p => ({ ...p, [key]: e.target.value }))} placeholder="8자 이상" />
                      <button onClick={() => setShowPw(s => ({ ...s, [key]: !s[key as keyof typeof s] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        {showPw[key as keyof typeof showPw] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                {error && <p style={{ fontSize: "12px", color: "#F87171" }}>{error}</p>}
                <button onClick={handlePasswordChange} disabled={pwLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", borderRadius: "10px", background: saved ? "rgba(16,185,129,0.1)" : "rgba(201,168,76,0.1)", border: `1px solid ${saved ? "rgba(16,185,129,0.25)" : "rgba(201,168,76,0.25)"}`, color: saved ? "var(--emerald)" : "var(--gold)", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                  {saved ? <><Check size={14} /> 변경완료</> : pwLoading ? "변경 중..." : <><Save size={14} /> 비밀번호 변경</>}
                </button>
              </div>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>보안 안내</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {SECURITY_TIPS.map((t) => (
                    <div key={t.title} style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                      <t.icon size={15} color="var(--gold)" style={{ flexShrink: 0, marginTop: "1px" }} />
                      <div><p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{t.title}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab !== "password" && (
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 24px", borderRadius: "12px", background: saved ? "rgba(16,185,129,0.1)" : "rgba(201,168,76,0.1)", border: `1px solid ${saved ? "rgba(16,185,129,0.25)" : "rgba(201,168,76,0.25)"}`, color: saved ? "var(--emerald)" : "var(--gold)", cursor: "pointer", fontSize: "14px", fontWeight: 700, alignSelf: "flex-start" }}>
              {saved ? <><Check size={15} /> 저장 완료</> : saving ? "저장 중..." : <><Save size={15} /> 저장</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
