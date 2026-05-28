"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import { Save, Check, Edit3, X, Users, TrendingUp, Zap, Award, ChevronRight, BarChart2 } from "lucide-react";

// ─── 타입 ───────────────────────────────────────────────
interface RankPlan {
  rankId: string;
  rankCode: string;
  rankName: string;
  rankLevel: number;
  rankColor: string;
  salesRate: number;   // 내 판매 수당 %
  refRate: number;     // 추천 수당 %
  overRate: number;    // 오버라이딩 %
  minGv: number;       // 승급 최소 누적 GV
  minDirect: number;   // 승급 직추천 최소 수
  // rule id refs
  salesRuleId: string;
  refRuleId: string;
  overRuleId: string;
  salesTierId: string;
  refTierId: string;
  overTierId: string;
}

const RANK_STYLE: Record<number, { main: string; bg: string; border: string; shadow: string; badge: string }> = {
  1: { main: "#378ADD", bg: "rgba(55,138,221,0.07)",  border: "rgba(55,138,221,0.25)",  shadow: "rgba(55,138,221,0.15)", badge: "rgba(55,138,221,0.15)" },
  2: { main: "#EF9F27", bg: "rgba(239,159,39,0.07)",  border: "rgba(239,159,39,0.25)",  shadow: "rgba(239,159,39,0.15)", badge: "rgba(239,159,39,0.15)" },
  3: { main: "#D4537E", bg: "rgba(212,83,126,0.07)",  border: "rgba(212,83,126,0.25)",  shadow: "rgba(212,83,126,0.15)", badge: "rgba(212,83,126,0.15)" },
};

const ITEM_COLORS = {
  sales: { main: "#378ADD", bg: "rgba(55,138,221,0.10)", label: "① 내 판매 수당" },
  ref:   { main: "#EF9F27", bg: "rgba(239,159,39,0.10)",  label: "② 추천 수당" },
  over:  { main: "#D4537E", bg: "rgba(212,83,126,0.10)", label: "③ 오버라이딩" },
};

// ─── 수치 입력 인라인 컴포넌트 ──────────────────────────
function RateInput({ value, onChange, color, disabled }: { value: number; onChange: (v: number) => void; color: string; disabled: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <input
        type="number" min={0} max={100} step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          width: "64px", padding: "6px 8px", borderRadius: "8px", textAlign: "center",
          fontSize: "18px", fontWeight: 800, fontFamily: "Syne, sans-serif",
          background: disabled ? "transparent" : "var(--bg)",
          border: disabled ? "none" : `1.5px solid ${color}`,
          color, outline: "none", transition: "all 0.15s",
        }}
      />
      <span style={{ fontSize: "16px", fontWeight: 700, color }}>%</span>
    </div>
  );
}

export default function PlanPage() {
  const [plans, setPlans] = useState<RankPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null); // rank level
  const [draft, setDraft] = useState<RankPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);

  // 시뮬레이션
  const [simSales, setSimSales] = useState(1000000);
  const [simDirect, setSimDirect] = useState(3);
  const [simDirectSales, setSimDirectSales] = useState(500000);
  const [simTeam, setSimTeam] = useState(3000000);
  const [showSim, setShowSim] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    const [{ data: ranks }, { data: rules }] = await Promise.all([
      supabase.from("ranks").select("*").order("level"),
      supabase.from("commission_rules")
        .select("id, name, rule_type, target_depth_from, is_volume_only, tiers:commission_tiers(id, rank_level, rate)")
        .eq("is_active", true),
    ]);

    const ruleList = (rules as any[]) ?? [];
    const salesRule = ruleList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 0 && !r.is_volume_only);
    const refRule   = ruleList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 1 && !r.is_volume_only);
    const overRule  = ruleList.find(r => r.rule_type === "TEAM" && !r.is_volume_only);

    const result: RankPlan[] = (ranks ?? []).map((r: any) => {
      const sTier = salesRule?.tiers?.find((t: any) => t.rank_level === r.level);
      const rTier = refRule?.tiers?.find((t: any)   => t.rank_level === r.level);
      const oTier = overRule?.tiers?.find((t: any)  => t.rank_level === r.level);
      return {
        rankId: r.id, rankCode: r.code, rankName: r.name,
        rankLevel: r.level, rankColor: r.color,
        salesRate: sTier?.rate ?? 0,
        refRate:   rTier?.rate ?? 0,
        overRate:  r.level >= 2 ? (oTier?.rate ?? 0) : 0,
        minGv:     r.min_gv ?? 0,
        minDirect: r.min_direct_referral ?? 0,
        salesRuleId: salesRule?.id ?? "", refRuleId: refRule?.id ?? "", overRuleId: overRule?.id ?? "",
        salesTierId: sTier?.id ?? "", refTierId: rTier?.id ?? "", overTierId: oTier?.id ?? "",
      };
    });

    setPlans(result);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(p: RankPlan) { setDraft({ ...p }); setEditing(p.rankLevel); }
  function cancelEdit() { setEditing(null); setDraft(null); }
  function updateDraft(key: keyof RankPlan, val: number) { setDraft(d => d ? { ...d, [key]: val } : d); }

  async function saveEdit() {
    if (!draft) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();

    // commission_tiers upsert
    const tierUpdates = [
      { id: draft.salesTierId, rule_id: draft.salesRuleId, rank_level: draft.rankLevel, rate: draft.salesRate },
      { id: draft.refTierId,   rule_id: draft.refRuleId,   rank_level: draft.rankLevel, rate: draft.refRate },
      { id: draft.overTierId,  rule_id: draft.overRuleId,  rank_level: draft.rankLevel, rate: draft.overRate },
    ].filter(t => t.rule_id);

    for (const t of tierUpdates) {
      if (t.id) {
        await supabase.from("commission_tiers").update({ rate: t.rate }).eq("id", t.id);
      } else {
        await supabase.from("commission_tiers").insert({ rule_id: t.rule_id, rank_level: t.rank_level, rate: t.rate });
      }
    }

    // ranks 승급 조건 업데이트
    await supabase.from("ranks").update({ min_gv: draft.minGv, min_direct_referral: draft.minDirect }).eq("id", draft.rankId);

    setSaving(false);
    setSaved(draft.rankLevel);
    setTimeout(() => setSaved(null), 2000);
    setEditing(null);
    setDraft(null);
    load();
  }

  // 시뮬레이션 계산
  const simResults = plans.map(p => {
    const salesComm = Math.floor(simSales * p.salesRate / 100);
    const refComm   = Math.floor(simDirect * simDirectSales * p.refRate / 100);
    const overComm  = Math.floor(simTeam * p.overRate / 100);
    const total     = salesComm + refComm + overComm;
    return { ...p, salesComm, refComm, overComm, total, net: Math.floor(total * 0.967) };
  });

  const totalBudget = plans.length > 0 ? (plans[plans.length - 1].salesRate + plans[plans.length - 1].refRate + plans[plans.length - 1].overRate) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "12px" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--bg-border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── 헤더 ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>수당 플랜</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>직급별 수당 비율과 승급 조건을 관리합니다</p>
        </div>
        {/* 총 재원 뱃지 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "12px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>총 수당 재원</span>
          <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--gold)" }}>{totalBudget}%</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 55%</span>
          <div style={{ width: "80px", height: "6px", background: "var(--bg-border)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((totalBudget / 55) * 100, 100)}%`, background: totalBudget > 55 ? "#F87171" : "var(--gold)", borderRadius: "3px", transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* ── 직급별 수당 카드 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {plans.map((p) => {
          const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
          const isEditing = editing === p.rankLevel;
          const cur = isEditing && draft ? draft : p;
          const total = cur.salesRate + cur.refRate + cur.overRate;

          return (
            <div key={p.rankId} style={{
              background: rs.bg, border: `1.5px solid ${isEditing ? rs.main : rs.border}`,
              borderRadius: "20px", padding: "22px", position: "relative", overflow: "hidden",
              boxShadow: isEditing ? `0 0 24px ${rs.shadow}` : "none",
              transition: "all 0.2s",
            }}>
              {/* 배경 원 */}
              <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: rs.main, opacity: 0.06, pointerEvents: "none" }} />

              {/* 직급 헤더 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
                <div>
                  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: rs.badge, color: rs.main, marginBottom: "6px" }}>
                    {p.rankLevel === 1 ? "PARTNER" : p.rankLevel === 2 ? "MANAGER" : "DIRECTOR"}
                  </span>
                  <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "24px", fontWeight: 800, color: rs.main }}>{p.rankName}</h3>
                </div>
                {/* 합계 원형 뱃지 */}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: rs.main, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{total}%</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.8)" }}>합계</span>
                </div>
              </div>

              {/* 수당 항목 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                {[
                  { key: "salesRate" as const, ...ITEM_COLORS.sales },
                  { key: "refRate"   as const, ...ITEM_COLORS.ref },
                  ...(p.rankLevel >= 2 ? [{ key: "overRate" as const, ...ITEM_COLORS.over }] : []),
                ].map(({ key, main, bg, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "12px", background: bg, border: `1px solid ${main}22` }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                    <RateInput value={cur[key]} onChange={(v) => isEditing && updateDraft(key, v)} color={main} disabled={!isEditing} />
                  </div>
                ))}
              </div>

              {/* 승급 조건 */}
              <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>승급 조건</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>직추천 최소</p>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="number" min={0} value={cur.minDirect} onChange={(e) => updateDraft("minDirect", Number(e.target.value))}
                          style={{ width: "52px", padding: "5px 7px", borderRadius: "7px", fontSize: "14px", fontWeight: 700, background: "var(--bg)", border: `1.5px solid ${rs.main}`, color: rs.main, outline: "none" }} />
                        <span style={{ fontSize: "12px", color: rs.main, fontWeight: 600 }}>명</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "16px", fontWeight: 800, color: rs.main, fontFamily: "Syne,sans-serif" }}>{p.minDirect}명</p>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>누적 매출</p>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="number" min={0} step={1000000} value={cur.minGv} onChange={(e) => updateDraft("minGv", Number(e.target.value))}
                          style={{ width: "80px", padding: "5px 7px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, background: "var(--bg)", border: `1.5px solid ${rs.main}`, color: rs.main, outline: "none" }} />
                        <span style={{ fontSize: "12px", color: rs.main, fontWeight: 600 }}>원</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "15px", fontWeight: 800, color: rs.main, fontFamily: "Syne,sans-serif" }}>
                        {p.minGv >= 10000000 ? `${(p.minGv / 10000000).toFixed(0)}천만` : p.minGv >= 10000 ? `${(p.minGv / 10000).toFixed(0)}만` : `${p.minGv.toLocaleString()}`}원
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              {!isEditing ? (
                <button onClick={() => startEdit(p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px", borderRadius: "12px", background: rs.badge, border: `1px solid ${rs.border}`, color: rs.main, cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "all 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${rs.main}22`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = rs.badge}
                >
                  {saved === p.rankLevel ? <><Check size={15} /> 저장 완료</> : <><Edit3 size={15} /> 수정하기</>}
                </button>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", borderRadius: "12px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                    <X size={14} /> 취소
                  </button>
                  <button onClick={saveEdit} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", borderRadius: "12px", background: rs.main, border: "none", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 700, opacity: saving ? 0.7 : 1, transition: "opacity 0.15s" }}>
                    {saving ? "저장 중..." : <><Save size={14} /> 저장</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 수당 구조 요약 테이블 ── */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart2 size={16} color="var(--gold)" />
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>수당 구조 한눈에 보기</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                <th style={{ padding: "12px 18px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>수당 항목</th>
                {plans.map(p => {
                  const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
                  return (
                    <th key={p.rankId} style={{ padding: "12px 18px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: rs.main }}>{p.rankName}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "① 내 판매 수당", key: "salesRate" as const, color: "#378ADD" },
                { label: "② 추천 수당",    key: "refRate"   as const, color: "#EF9F27" },
                { label: "③ 오버라이딩",  key: "overRate"  as const, color: "#D4537E" },
              ].map(({ label, key, color }) => (
                <tr key={label} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  <td style={{ padding: "12px 18px", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "3px", background: color, display: "inline-block", flexShrink: 0 }} />
                      {label}
                    </span>
                  </td>
                  {plans.map(p => {
                    const val = p[key];
                    const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
                    return (
                      <td key={p.rankId} style={{ padding: "12px 18px", textAlign: "center" }}>
                        {val > 0 ? (
                          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", fontSize: "14px", fontWeight: 800, background: `${color}15`, color, border: `1px solid ${color}33` }}>{val}%</span>
                        ) : (
                          <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* 합계 */}
              <tr style={{ background: "rgba(201,168,76,0.04)" }}>
                <td style={{ padding: "14px 18px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>합계</td>
                {plans.map(p => {
                  const total = p.salesRate + p.refRate + p.overRate;
                  const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
                  return (
                    <td key={p.rankId} style={{ padding: "14px 18px", textAlign: "center" }}>
                      <span style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: rs.main }}>{total}%</span>
                    </td>
                  );
                })}
              </tr>
              {/* 승급 조건 */}
              <tr style={{ borderTop: "2px solid var(--bg-border)" }}>
                <td style={{ padding: "12px 18px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>직추천 조건</td>
                {plans.map(p => {
                  const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
                  return <td key={p.rankId} style={{ padding: "12px 18px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: rs.main }}>{p.minDirect > 0 ? `${p.minDirect}명 이상` : "제한없음"}</td>;
                })}
              </tr>
              <tr>
                <td style={{ padding: "12px 18px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>누적 매출 조건</td>
                {plans.map(p => {
                  const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
                  const gvLabel = p.minGv >= 10000000 ? `${(p.minGv/10000000).toFixed(0)}천만원` : p.minGv >= 10000 ? `${(p.minGv/10000).toFixed(0)}만원` : p.minGv > 0 ? `${p.minGv.toLocaleString()}원` : "제한없음";
                  return <td key={p.rankId} style={{ padding: "12px 18px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: rs.main }}>{gvLabel}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 시뮬레이션 토글 버튼 ── */}
      <button onClick={() => setShowSim(s => !s)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", borderRadius: "16px", background: showSim ? "rgba(167,139,250,0.08)" : "var(--bg-elevated)", border: `1.5px solid ${showSim ? "rgba(167,139,250,0.35)" : "var(--bg-border)"}`, cursor: "pointer", transition: "all 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={18} color="#A78BFA" />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: showSim ? "#A78BFA" : "var(--text-primary)" }}>수당 시뮬레이션</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>매출 조건 입력 → 직급별 예상 수당 비교</p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" style={{ transform: showSim ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {/* ── 시뮬레이션 패널 ── */}
      {showSim && (
        <div style={{ background: "var(--bg-elevated)", border: "1.5px solid rgba(167,139,250,0.25)", borderRadius: "18px", padding: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* 입력 4칸 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { label: "내 직접 판매 매출",     state: simSales,       setState: setSimSales,       step: 100000, max: 10000000, color: "#378ADD" },
              { label: "직접 추천 인원",         state: simDirect,      setState: setSimDirect,      step: 1,      max: 30,       color: "#EF9F27", unit: "명" },
              { label: "추천인 인당 평균 매출",  state: simDirectSales, setState: setSimDirectSales, step: 100000, max: 3000000,  color: "#EF9F27" },
              { label: "산하 팀 전체 매출",      state: simTeam,        setState: setSimTeam,        step: 500000, max: 20000000, color: "#D4537E" },
            ].map(({ label, state, setState, step, max, color, unit }) => (
              <div key={label} style={{ background: "var(--bg)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>{label}</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color, marginBottom: "8px" }}>
                  {unit ? `${state.toLocaleString()}${unit}` : formatKRW(state)}
                </p>
                <input type="range" min={0} max={max} step={step} value={state}
                  onChange={(e) => setState(Number(e.target.value))}
                  style={{ width: "100%", accentColor: color }} />
              </div>
            ))}
          </div>

          {/* 직급별 결과 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {simResults.map(r => {
              const rs = RANK_STYLE[r.rankLevel] ?? RANK_STYLE[1];
              return (
                <div key={r.rankId} style={{ background: rs.bg, border: `1.5px solid ${rs.border}`, borderRadius: "16px", padding: "18px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: rs.main, marginBottom: "12px" }}>{r.rankName}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                    {[
                      { label: "① 판매수당", val: r.salesComm, color: "#378ADD" },
                      { label: "② 추천수당", val: r.refComm,   color: "#EF9F27" },
                      { label: "③ 오버라이딩", val: r.overComm, color: "#D4537E" },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span style={{ fontWeight: 600, color }}>{formatKRW(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid ${rs.border}`, paddingTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>월 합계</span>
                      <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: rs.main }}>{formatKRW(r.total)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>실수령 (3.3%↓)</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--emerald)" }}>{formatKRW(r.net)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
