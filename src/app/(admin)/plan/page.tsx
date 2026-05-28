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

  // 시뮬레이션 입력 (draft: 입력중 / applied: 적용된 값)
  const [simDraft, setSimDraft] = useState({ mySales: 1000000, directCount: 3, directSales: 500000, teamSales: 3000000, totalMonthSales: 10000000 });
  const [simApplied, setSimApplied] = useState({ mySales: 1000000, directCount: 3, directSales: 500000, teamSales: 3000000, totalMonthSales: 10000000 });
  const [showSim, setShowSim] = useState(false);
  const [simRun, setSimRun] = useState(false);

  function updateSimDraft(key: string, val: number) {
    setSimDraft(d => ({ ...d, [key]: isNaN(val) ? 0 : val }));
  }
  function applySim(e?: React.MouseEvent) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSimApplied({ ...simDraft });
    setSimRun(true);
  }

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

    // PDF 기본값 (DB 없어도 무조건 동작)
    const DEFAULT_RATES: Record<number, {s:number,r:number,o:number}> = {
      1: { s: 25, r: 5, o: 0 },
      2: { s: 28, r: 7, o: 3 },
      3: { s: 32, r: 10, o: 8 },
    };
    // ranks DB 없으면 PDF 기본 직급 사용
    const rankList = (ranks && ranks.length > 0) ? ranks : [
      { id: "default-1", code: "PARTNER",  name: "파트너", level: 1, color: "#378ADD", min_gv: 50000,     min_direct_referral: 0 },
      { id: "default-2", code: "MANAGER",  name: "매니저", level: 2, color: "#EF9F27", min_gv: 5000000,   min_direct_referral: 5 },
      { id: "default-3", code: "DIRECTOR", name: "디렉터", level: 3, color: "#D4537E", min_gv: 50000000,  min_direct_referral: 3 },
    ];
    const result: RankPlan[] = rankList.map((r: any) => {
      const def = DEFAULT_RATES[r.level] ?? { s: 0, r: 0, o: 0 };
      const sTier = salesRule?.tiers?.find((t: any) => t.rank_level === r.level);
      const rTier = refRule?.tiers?.find((t: any)   => t.rank_level === r.level);
      const oTier = overRule?.tiers?.find((t: any)  => t.rank_level === r.level);
      return {
        rankId: r.id, rankCode: r.code, rankName: r.name,
        rankLevel: r.level, rankColor: r.color,
        salesRate: sTier?.rate ?? def.s,
        refRate:   rTier?.rate ?? def.r,
        overRate:  r.level >= 2 ? (oTier?.rate ?? def.o) : 0,
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

  // 시뮬레이션 계산 (적용된 값 기준)
  const { mySales, directCount, directSales, teamSales, totalMonthSales } = simApplied;
  const simResults = plans.map(p => {
    const salesComm = Math.floor(mySales * p.salesRate / 100);
    const refComm   = Math.floor(directCount * directSales * p.refRate / 100);
    const overComm  = Math.floor(teamSales * p.overRate / 100);
    const total     = salesComm + refComm + overComm;
    // 마케팅 지원비 (전체 월매출 기준)
    const mktMgr  = Math.floor(totalMonthSales * 0.02); // 2% 매니저 풀
    const mktDir  = Math.floor(totalMonthSales * 0.02); // 2% 디렉터 풀
    const mktRand = Math.floor(totalMonthSales * 0.01); // 1% 관리자 재량
    // 내 직급 판단: 승급 조건 충족 여부
    const myDirectTotal = directCount * directSales;
    return { ...p, salesComm, refComm, overComm, total, net: Math.floor(total * 0.967), mktMgr, mktDir, mktRand };
  });

  // 내 현재 직급 판정 (입력 조건 기준)
  const myDirectTotal = directCount * directSales;
  const myRank = [...plans].reverse().find(p =>
    directCount >= p.minDirect && (teamSales + mySales) >= p.minGv
  ) ?? plans[0];

  // 마케팅 지원비 (전체 월매출 기준)
  const mktPool = { mgr: Math.floor(totalMonthSales * 0.02), dir: Math.floor(totalMonthSales * 0.02), rand: Math.floor(totalMonthSales * 0.01) };
  const mgrCount = plans.filter(p => p.rankLevel === 2).length || 1;
  const dirCount = plans.filter(p => p.rankLevel === 3).length || 1;

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
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>조건 입력 후 적용하기 → 내 직급 + 수당 자동 계산</p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" style={{ transform: showSim ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {showSim && (
        <div style={{ background: "var(--bg-elevated)", border: "1.5px solid rgba(167,139,250,0.25)", borderRadius: "18px", padding: "22px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── 입력 영역 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>조건 입력</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>

              {/* 내 매출 */}
              {[
                { label: "내 직접 판매 매출", key: "mySales",      max: 10000000, step: 100000, color: "#378ADD", unit: "원" },
                { label: "직접 추천 인원",    key: "directCount",  max: 50,       step: 1,      color: "#EF9F27", unit: "명" },
                { label: "추천인 인당 매출",  key: "directSales",  max: 5000000,  step: 100000, color: "#EF9F27", unit: "원" },
                { label: "산하 팀 전체 매출", key: "teamSales",    max: 30000000, step: 500000, color: "#D4537E", unit: "원" },
                { label: "전체 회사 월 매출", key: "totalMonthSales", max: 100000000, step: 1000000, color: "#A78BFA", unit: "원", desc: "마케팅 지원비 5% 계산 기준" },
              ].map(({ label, key, max, step, color, unit, desc }) => {
                const val = simDraft[key as keyof typeof simDraft];
                return (
                  <div key={key} style={{ background: "var(--bg)", border: `1px solid ${color}22`, borderRadius: "14px", padding: "14px" }}>
                    <p style={{ fontSize: "11px", color, fontWeight: 700, marginBottom: "2px" }}>{label}</p>
                    {desc && <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px" }}>{desc}</p>}

                    {/* 숫자 직접 입력 */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px", marginTop: desc ? 0 : "6px" }}>
                      <input
                        type="number" min={0} max={max} step={step}
                        value={val === 0 ? "" : val}
                        placeholder="직접 입력"
                        onChange={(e) => updateSimDraft(key, Number(e.target.value.replace(/,/g, "")))}
                        style={{
                          flex: 1, padding: "8px 10px", borderRadius: "9px",
                          fontSize: "16px", fontWeight: 800, fontFamily: "Syne, sans-serif",
                          background: "var(--bg-elevated)", border: `1.5px solid ${color}`,
                          color, outline: "none", width: "100%",
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: 600, color, flexShrink: 0 }}>{unit}</span>
                    </div>

                    {/* 슬라이더 */}
                    <input
                      type="range" min={0} max={max} step={step} value={val}
                      onChange={(e) => updateSimDraft(key, Number(e.target.value))}
                      style={{ width: "100%", accentColor: color, cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>0</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{unit === "명" ? `${max}명` : `${(max/10000).toFixed(0)}만원`}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 적용하기 버튼 */}
            <button type="button" onClick={(e) => applySim(e)} style={{ marginTop: "14px", width: "100%", padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg, #7C3AED, #A78BFA)", border: "none", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.15s", letterSpacing: "0.03em" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              <TrendingUp size={18} /> 적용하기 — 수당 계산
            </button>
          </div>

          {/* ── 결과 영역 (적용 후) ── */}
          {simRun && (
            <>
              {/* 내 직급 판정 */}
              {myRank && (
                <div style={{ background: `${RANK_STYLE[myRank.rankLevel]?.main ?? "#C9A84C"}14`, border: `2px solid ${RANK_STYLE[myRank.rankLevel]?.main ?? "#C9A84C"}`, borderRadius: "16px", padding: "18px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: RANK_STYLE[myRank.rankLevel]?.main, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Award size={26} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>입력 조건 기준 현재 직급</p>
                    <p style={{ fontFamily: "Syne,sans-serif", fontSize: "24px", fontWeight: 800, color: RANK_STYLE[myRank.rankLevel]?.main }}>{myRank.rankName}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      직추천 {directCount}명 · 팀매출 {formatKRW(teamSales + mySales)} · 수당률 합계 {myRank.salesRate + myRank.refRate + myRank.overRate}%
                    </p>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>예상 월 수당</p>
                    <p style={{ fontFamily: "Syne,sans-serif", fontSize: "28px", fontWeight: 800, color: RANK_STYLE[myRank.rankLevel]?.main }}>
                      {formatKRW(simResults.find(r => r.rankLevel === myRank.rankLevel)?.total ?? 0)}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--emerald)" }}>
                      실수령 {formatKRW(simResults.find(r => r.rankLevel === myRank.rankLevel)?.net ?? 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* 직급별 수당 카드 */}
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>직급별 수당 상세</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {simResults.map(r => {
                    const rs = RANK_STYLE[r.rankLevel] ?? RANK_STYLE[1];
                    const isMe = myRank?.rankLevel === r.rankLevel;
                    return (
                      <div key={r.rankId} style={{ background: rs.bg, border: `${isMe ? "2px" : "1px"} solid ${isMe ? rs.main : rs.border}`, borderRadius: "16px", padding: "18px", position: "relative" }}>
                        {isMe && <span style={{ position: "absolute", top: -10, right: 14, padding: "2px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, background: rs.main, color: "#fff" }}>현재 내 직급</span>}
                        <p style={{ fontSize: "14px", fontWeight: 800, color: rs.main, marginBottom: "12px" }}>{r.rankName}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "12px" }}>
                          {[
                            { label: "① 판매수당",   val: r.salesComm, color: "#378ADD", sub: `${formatKRW(mySales)} × ${r.salesRate}%` },
                            { label: "② 추천수당",   val: r.refComm,   color: "#EF9F27", sub: `${directCount}명 × ${formatKRW(directSales)} × ${r.refRate}%` },
                            { label: "③ 오버라이딩", val: r.overComm,  color: "#D4537E", sub: r.rankLevel >= 2 ? `${formatKRW(teamSales)} × ${r.overRate}%` : "해당없음" },
                          ].map(({ label, val, color, sub }) => (
                            <div key={label} style={{ background: "rgba(0,0,0,0.06)", borderRadius: "9px", padding: "8px 10px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
                                <span style={{ fontSize: "13px", fontWeight: 800, color }}>{formatKRW(val)}</span>
                              </div>
                              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{sub}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: `1px solid ${rs.border}`, paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>월 합계 (세전)</p>
                            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: rs.main }}>{formatKRW(r.total)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>실수령</p>
                            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--emerald)" }}>{formatKRW(r.net)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 마케팅 지원비 5% 풀 */}
              <div style={{ background: "rgba(167,139,250,0.06)", border: "1.5px solid rgba(167,139,250,0.25)", borderRadius: "18px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Zap size={18} color="#A78BFA" />
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#A78BFA" }}>마케팅 지원비 5% 풀</p>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>전체 월매출 {formatKRW(simApplied.totalMonthSales)} 기준</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                  {[
                    { label: "매니저 풀 2%",    color: "#EF9F27", amount: mktPool.mgr,  sub: `매니저 인원으로 N분의1 균등 배분`,         icon: "👔" },
                    { label: "디렉터 풀 2%",    color: "#D4537E", amount: mktPool.dir,  sub: `디렉터 인원으로 N분의1 균등 배분`,         icon: "👑" },
                    { label: "관리자 재량 1%",  color: "#A78BFA", amount: mktPool.rand, sub: "관리자가 대상 직접 지정·지급",              icon: "🎯" },
                  ].map(({ label, color, amount, sub, icon }) => (
                    <div key={label} style={{ background: "var(--bg-elevated)", border: `1px solid ${color}33`, borderRadius: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{icon}</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color }}>{label}</span>
                      </div>
                      <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color, marginBottom: "4px" }}>{formatKRW(amount)}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "10px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>마케팅 지원비 합계 (5%)</span>
                  <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "#A78BFA" }}>{formatKRW(mktPool.mgr + mktPool.dir + mktPool.rand)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
