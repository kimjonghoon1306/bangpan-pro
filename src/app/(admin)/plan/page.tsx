"use client";

import { useState } from "react";
import {
  Plus, Save, Play, Shield, Layers, GitBranch,
  Grid3X3, Shuffle, ChevronDown, ChevronRight,
  Trash2, Check, Info, ToggleLeft, ToggleRight,
} from "lucide-react";

const PLAN_TYPES = [
  { type: "UNILEVEL", label: "유니레벨", icon: Layers, desc: "무제한 폭, 깊이 제한 수당" },
  { type: "BINARY",   label: "바이너리", icon: GitBranch, desc: "좌/우 2라인 매칭 수당" },
  { type: "MATRIX",   label: "매트릭스", icon: Grid3X3, desc: "폭×깊이 고정 구조" },
  { type: "HYBRID",   label: "혼합형",   icon: Shuffle, desc: "두 가지 이상 구조 결합" },
  { type: "SHARED",   label: "공유수당형", icon: Shield, desc: "2단계 수당 + 볼륨 (법적 안전)" },
];

const RULE_TYPES = [
  { value: "REFERRAL",   label: "추천수당",  desc: "직접 추천인 구매 수당" },
  { value: "TEAM",       label: "팀수당",    desc: "하위 네트워크 매출 수당" },
  { value: "RANK_BONUS", label: "직급수당",  desc: "직급별 추가 보너스" },
  { value: "MATCHING",   label: "매칭수당",  desc: "하위자 수당의 일정 % 수령" },
  { value: "VOLUME",     label: "볼륨(승급용)", desc: "수당 없이 직급 승급 볼륨만" },
];

const INITIAL_RULES = [
  { id: "1", name: "직접추천수당", rule_type: "REFERRAL", depth_from: 1, depth_to: 1, side: "ALL", calc_type: "PERCENT", value: 10, base: "BV", min_rank: 0, min_pv: 0, is_volume_only: false, max_amount: 0, is_active: true },
  { id: "2", name: "간접수당 2단계", rule_type: "TEAM", depth_from: 2, depth_to: 2, side: "ALL", calc_type: "PERCENT", value: 5, base: "BV", min_rank: 1, min_pv: 100, is_volume_only: false, max_amount: 0, is_active: true },
  { id: "3", name: "볼륨 (3단계~)", rule_type: "VOLUME", depth_from: 3, depth_to: 0, side: "ALL", calc_type: "PERCENT", value: 0, base: "BV", min_rank: 0, min_pv: 0, is_volume_only: true, max_amount: 0, is_active: true },
];

export default function PlanPage() {
  const [planType, setPlanType] = useState("SHARED");
  const [planName, setPlanName] = useState("공유수당 플랜 v1");
  const [rules, setRules] = useState(INITIAL_RULES);
  const [expanded, setExpanded] = useState<string | null>("1");
  const [saved, setSaved] = useState(false);

  function updateRule(id: string, key: string, val: any) {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, [key]: val } : rule));
  }

  function addRule() {
    const newId = String(Date.now());
    setRules(r => [...r, { id: newId, name: "새 수당 규칙", rule_type: "REFERRAL", depth_from: 1, depth_to: 1, side: "ALL", calc_type: "PERCENT", value: 0, base: "BV", min_rank: 0, min_pv: 0, is_volume_only: false, max_amount: 0, is_active: true }]);
    setExpanded(newId);
  }

  function removeRule(id: string) {
    setRules(r => r.filter(rule => rule.id !== id));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: "24px", minHeight: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>수당 플랜 설정</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>플랜 구조와 수당 규칙을 정의합니다</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {saved && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", fontSize: "13px" }}>
              <Check size={14} /> 저장완료
            </div>
          )}
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            <Play size={14} /> 시뮬레이션
          </button>
          <button onClick={handleSave} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <Save size={14} /> 저장
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>

        {/* 좌측 — 플랜 설정 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 플랜 기본 정보 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>플랜 기본 정보</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 }}>플랜명</label>
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="input-base" style={{ fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>플랜 유형</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                  {PLAN_TYPES.map((pt) => (
                    <button key={pt.type} onClick={() => setPlanType(pt.type)} style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px",
                      padding: "12px", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                      background: planType === pt.type ? "rgba(201,168,76,0.1)" : "var(--bg)",
                      border: `1px solid ${planType === pt.type ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <pt.icon size={14} color={planType === pt.type ? "var(--gold)" : "var(--text-muted)"} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: planType === pt.type ? "var(--gold)" : "var(--text-primary)" }}>{pt.label}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {planType === "SHARED" && (
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", gap: "10px" }}>
                  <Shield size={15} color="var(--gold)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)", marginBottom: "2px" }}>공유수당형 선택됨</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>수당은 1~2단계까지만 지급, 3단계 이하는 직급 승급용 볼륨으로만 집계됩니다. 다단계판매업 등록 없이 운영 가능한 구조입니다.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 수당 규칙 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>수당 규칙 ({rules.length}개)</h3>
              <button onClick={addRule} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                <Plus size={13} /> 규칙 추가
              </button>
            </div>

            <div style={{ padding: "12px" }}>
              {rules.map((rule, idx) => (
                <div key={rule.id} style={{ border: `1px solid ${expanded === rule.id ? "rgba(201,168,76,0.25)" : "var(--bg-border)"}`, borderRadius: "12px", overflow: "hidden", marginBottom: "8px" }}>
                  {/* 규칙 헤더 */}
                  <button onClick={() => setExpanded(expanded === rule.id ? null : rule.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{idx + 1}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{rule.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: rule.is_volume_only ? "var(--bg-border)" : "rgba(201,168,76,0.12)", color: rule.is_volume_only ? "var(--text-muted)" : "var(--gold)" }}>
                        {rule.is_volume_only ? "볼륨" : `${rule.value}%`}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {rule.depth_from}단계{rule.depth_to === 0 ? "~∞" : rule.depth_from !== rule.depth_to ? `~${rule.depth_to}단계` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: rule.is_active ? "var(--emerald)" : "var(--bg-border)" }} />
                      {expanded === rule.id ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                    </div>
                  </button>

                  {/* 규칙 상세 */}
                  {expanded === rule.id && (
                    <div style={{ padding: "14px", borderTop: "1px solid var(--bg-border)", background: "rgba(0,0,0,0.1)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>규칙명</label>
                          <input type="text" value={rule.name} onChange={(e) => updateRule(rule.id, "name", e.target.value)} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>규칙 유형</label>
                          <select value={rule.rule_type} onChange={(e) => updateRule(rule.id, "rule_type", e.target.value)} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }}>
                            {RULE_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>계산 방식</label>
                          <select value={rule.calc_type} onChange={(e) => updateRule(rule.id, "calc_type", e.target.value)} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }}>
                            <option value="PERCENT">비율 (%)</option>
                            <option value="FIXED">고정금액 (원)</option>
                            <option value="TIER">직급별 차등</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>시작 단계</label>
                          <input type="number" value={rule.depth_from} onChange={(e) => updateRule(rule.id, "depth_from", Number(e.target.value))} min={1} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>종료 단계 (0=무제한)</label>
                          <input type="number" value={rule.depth_to} onChange={(e) => updateRule(rule.id, "depth_to", Number(e.target.value))} min={0} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>{rule.calc_type === "PERCENT" ? "비율 (%)" : "금액 (원)"}</label>
                          <input type="number" value={rule.value} onChange={(e) => updateRule(rule.id, "value", Number(e.target.value))} step={0.1} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>계산 기준</label>
                          <select value={rule.base} onChange={(e) => updateRule(rule.id, "base", e.target.value)} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }}>
                            <option value="BV">BV</option>
                            <option value="PV">PV</option>
                            <option value="PRICE">판매가</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>최소 직급 레벨</label>
                          <input type="number" value={rule.min_rank} onChange={(e) => updateRule(rule.id, "min_rank", Number(e.target.value))} min={0} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>최소 개인 PV</label>
                          <input type="number" value={rule.min_pv} onChange={(e) => updateRule(rule.id, "min_pv", Number(e.target.value))} min={0} className="input-base" style={{ fontSize: "12px", padding: "7px 10px" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--bg-border)" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => updateRule(rule.id, "is_volume_only", !rule.is_volume_only)}>
                          <div style={{ width: 36, height: 20, borderRadius: "999px", background: rule.is_volume_only ? "rgba(201,168,76,0.3)" : "var(--bg-border)", position: "relative", transition: "background 0.2s" }}>
                            <span style={{ position: "absolute", top: 2, left: rule.is_volume_only ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: rule.is_volume_only ? "var(--gold)" : "var(--text-muted)", transition: "left 0.2s" }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>볼륨 전용 (수당 미지급, 직급 승급만)</span>
                        </label>
                        <button onClick={() => removeRule(rule.id)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px", padding: "4px 8px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F87171"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                        >
                          <Trash2 size={13} /> 삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={addRule} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", borderRadius: "12px", border: "1px dashed var(--bg-border)", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                <Plus size={15} /> 수당 규칙 추가
              </button>
            </div>
          </div>
        </div>

        {/* 우측 — 요약 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>수당 구조 요약</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rules.map((rule, i) => (
                <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rule.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {rule.depth_from}단계{rule.depth_to === 0 ? "~무제한" : rule.depth_from !== rule.depth_to ? `~${rule.depth_to}단계` : ""} · {rule.is_volume_only ? "볼륨전용" : `${rule.value}${rule.calc_type === "PERCENT" ? "%" : "원"}`}
                    </p>
                  </div>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: rule.is_active ? "var(--emerald)" : "var(--bg-border)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* 시뮬레이션 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Play size={14} color="var(--accent)" /> 수당 시뮬레이션
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>주문 금액 (원)</label>
                <input type="number" placeholder="100000" className="input-base" style={{ fontSize: "13px", padding: "8px 12px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>BV</label>
                <input type="number" placeholder="90000" className="input-base" style={{ fontSize: "13px", padding: "8px 12px" }} />
              </div>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <Play size={14} /> 계산해보기
              </button>
              <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>예상 수당 발생</p>
                {rules.filter(r => !r.is_volume_only).map((rule) => (
                  <div key={rule.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{rule.name}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
                      ₩{Math.floor(90000 * rule.value / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--bg-border)", marginTop: "6px", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>합계</span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>
                    ₩{rules.filter(r => !r.is_volume_only).reduce((s, r) => s + Math.floor(90000 * r.value / 100), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
