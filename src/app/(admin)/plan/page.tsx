"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import { Save, Check, Edit3, X, Users, TrendingUp, Zap, Award, ChevronRight, BarChart2, HelpCircle, BookOpen, Settings2, Calculator, Shield, FileText } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

// ─── 사용 가이드 팝업 ─────────────────────────────────
const GUIDE_ITEMS = [
  {
    icon: Shield,
    color: "#378ADD",
    bg: "rgba(55,138,221,0.10)",
    title: "직급별 수당 카드",
    desc: "멤버·매니저·디렉터 3개 카드에서 각 직급의 수당 비율을 한눈에 확인합니다.",
    steps: [
      "수정하기 버튼 클릭 → 해당 카드가 활성화됩니다",
      "① 판권(소개수수료) / ② 관리비용(오버라이드) % 숫자를 직접 수정",
      "승급 조건(직추천 수, 누적 매출)도 같은 화면에서 수정 가능",
      "저장 버튼 클릭 → DB에 즉시 반영",
    ],
  },
  {
    icon: BarChart2,
    color: "#EF9F27",
    bg: "rgba(239,159,39,0.10)",
    title: "수당 구조 한눈에 보기",
    desc: "모든 직급의 수당 항목과 승급 조건을 표 형태로 비교합니다.",
    steps: [
      "직급별 판권·관리비용·패스트스타트·팀원첫모집 비율 한 번에 확인",
      "합계 % 와 승급 조건(직추천·누적매출)도 표시",
      "총 수당 재원: 관리자 55% / 회원 표시 54% (회사재량 1% 차이)",
    ],
  },
  {
    icon: Calculator,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.10)",
    title: "수당 시뮬레이션",
    desc: "창업비 기준 예상 수당은 별도 시뮬레이션 페이지에서 계산합니다.",
    steps: [
      "하단 '수당 시뮬레이션' 카드 클릭 → 시뮬레이션 페이지로 이동",
      "내 직급(매니저/디렉터) 선택",
      "직추천 매니저·디렉터 수, 패스트스타트·팀원첫모집 입력",
      "예상 수당과 실수령액이 자동 계산됩니다",
    ],
  },
  {
    icon: Zap,
    color: "#D4537E",
    bg: "rgba(212,83,126,0.10)",
    title: "5% 풀 배분",
    desc: "전체 창업비 매출에서 별도로 적립하는 공유 재원입니다.",
    steps: [
      "매니저 풀 2% — 전체 매니저 인원으로 N분의1 균등 배분",
      "디렉터 풀 2% — 전체 디렉터 인원으로 N분의1 균등 배분",
      "회사 재량 1% — 마감·정산 페이지에서 직접 대상자 지정",
      "월 창업비 총액 입력칸에서 실시간 금액 확인 가능",
    ],
  },
];

function PlanGuideModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "740px", maxHeight: "90vh", overflowY: "auto",
        background: "var(--bg-elevated)", borderRadius: "24px",
        border: "1px solid var(--bg-border)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        animation: "slideUp 0.25s ease",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: "1px solid var(--bg-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(108,71,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#6C47FF" />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>수당 플랜 사용 가이드</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>각 기능을 클릭해 사용법을 확인하세요</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={15} />
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "6px", padding: "16px 24px 0", overflowX: "auto" }}>
          {GUIDE_ITEMS.map((g, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "10px", whiteSpace: "nowrap",
              background: active === i ? g.bg : "transparent",
              border: `1.5px solid ${active === i ? g.color : "var(--bg-border)"}`,
              color: active === i ? g.color : "var(--text-muted)",
              cursor: "pointer", fontSize: "12px", fontWeight: 600,
              transition: "all 0.15s",
            }}>
              <g.icon size={13} />
              {g.title}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div style={{ padding: "20px 24px 24px" }}>
          {GUIDE_ITEMS.map((g, i) => active !== i ? null : (
            <div key={i} style={{ animation: "slideUp 0.2s ease" }}>
              {/* 설명 */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px", borderRadius: "16px", background: g.bg, border: `1px solid ${g.color}33`, marginBottom: "18px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "12px", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <g.icon size={22} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: g.color, margin: "0 0 4px" }}>{g.title}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
                </div>
              </div>

              {/* 스텝 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {g.steps.map((step, si) => (
                  <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: "1px" }}>{si + 1}</div>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 타입 ───────────────────────────────────────────────
interface RankPlan {
  rankId: string;
  rankCode: string;
  rankName: string;
  rankLevel: number;
  rankColor: string;
  salesRate: number;   // 판권(소개수수료) %
  refRate: number;     // 관리비용(오버라이드) %
  fastRate: number;    // 패스트스타트 %
  firstRate: number;   // 팀원첫모집 %
  overRate: number;    // (미사용)
  minGv: number;       // 승급 최소 누적 GV
  minDirect: number;   // 승급 직추천 최소 수
  // rule id refs
  salesRuleId: string;
  refRuleId: string;
  fastRuleId: string;
  firstRuleId: string;
  overRuleId: string;
  salesTierId: string;
  refTierId: string;
  fastTierId: string;
  firstTierId: string;
  overTierId: string;
}

const RANK_STYLE: Record<number, { main: string; bg: string; border: string; shadow: string; badge: string; icon: string }> = {
  1: { main: "#6B7280", bg: "rgba(107,114,128,0.07)", border: "rgba(107,114,128,0.25)", shadow: "rgba(107,114,128,0.15)", badge: "rgba(107,114,128,0.15)", icon: "👤" },
  2: { main: "#378ADD", bg: "rgba(55,138,221,0.07)",  border: "rgba(55,138,221,0.25)",  shadow: "rgba(55,138,221,0.15)", badge: "rgba(55,138,221,0.15)",  icon: "👔" },
  3: { main: "#E8599A", bg: "rgba(232,89,154,0.07)",  border: "rgba(232,89,154,0.25)",  shadow: "rgba(232,89,154,0.15)", badge: "rgba(232,89,154,0.15)",  icon: "👑" },
};

const ITEM_COLORS = {
  sales: { main: "#4FA3E8", bg: "rgba(79,163,232,0.10)", label: "① 판권 (소개수수료)" },
  ref:   { main: "#EF9F27", bg: "rgba(239,159,39,0.10)",  label: "② 관리비용 (오버라이드)" },
  fast:  { main: "#10B981", bg: "rgba(16,185,129,0.10)",  label: "③ 패스트 스타트" },
  first: { main: "#F472B6", bg: "rgba(244,114,182,0.10)", label: "④ 팀원 첫모집" },
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
    // ① 판권(소개수수료) = REFERRAL depth1 (멤버5/매니저25/디렉터32)
    const salesRule = ruleList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 1 && !r.is_volume_only)
                   ?? ruleList.find(r => r.rule_type === "REFERRAL" && !r.is_volume_only);
    // ② 관리비용(오버라이드) = MATCHING 중 이름에 '관리비용/오버' 포함 (10%)
    const refRule   = ruleList.find(r => r.rule_type === "MATCHING" && (String(r.name).includes("관리비용") || String(r.name).includes("오버")))
                   ?? ruleList.find(r => r.rule_type === "MATCHING");
    // ③ 패스트스타트 = RANK_BONUS (매니저3/디렉터5)
    const fastRule  = ruleList.find(r => r.rule_type === "RANK_BONUS");
    // ④ 팀원첫모집 = MATCHING 중 이름에 '첫모집' 포함 (매니저2/디렉터3)
    const firstRule = ruleList.find(r => r.rule_type === "MATCHING" && String(r.name).includes("첫모집"));

    // 기본값 (DB 없어도 동작) — s:판권 / r:관리비용 / fast:패스트 / first:첫모집
    const DEFAULT_RATES: Record<number, {s:number,r:number,fast:number,first:number}> = {
      1: { s: 5,  r: 0,  fast: 0, first: 0 },
      2: { s: 25, r: 10, fast: 3, first: 2 },
      3: { s: 32, r: 10, fast: 5, first: 3 },
    };
    const rankList = (ranks && ranks.length > 0) ? ranks : [
      { id: "default-1", code: "MEMBER",   name: "멤버",   level: 1, color: "#6B7280", min_gv: 50000,     min_direct_referral: 0 },
      { id: "default-2", code: "MANAGER",  name: "매니저", level: 2, color: "#378ADD", min_gv: 10000000,  min_direct_referral: 0 },
      { id: "default-3", code: "DIRECTOR", name: "디렉터", level: 3, color: "#D4537E", min_gv: 20000000,  min_direct_referral: 3 },
    ];
    const result: RankPlan[] = rankList.map((r: any) => {
      const def = DEFAULT_RATES[r.level] ?? { s: 0, r: 0, fast: 0, first: 0 };
      const sTier = salesRule?.tiers?.find((t: any) => t.rank_level === r.level);
      const rTier = refRule?.tiers?.find((t: any)   => t.rank_level === r.level);
      const fTier = fastRule?.tiers?.find((t: any)  => t.rank_level === r.level);
      const ftTier = firstRule?.tiers?.find((t: any) => t.rank_level === r.level);
      // 멤버(level 1)는 판권만. 매니저 이상만 관리비용/패스트/첫모집 적용
      const refVal   = r.level >= 2 ? (rTier?.rate  ?? refRule?.value ?? def.r) : 0;
      const fastVal  = r.level >= 2 ? (fTier?.rate  ?? def.fast) : 0;
      const firstVal = r.level >= 2 ? (ftTier?.rate ?? def.first) : 0;
      return {
        rankId: r.id, rankCode: r.code, rankName: r.name,
        rankLevel: r.level, rankColor: r.color,
        salesRate: sTier?.rate ?? def.s,
        refRate:   refVal,
        fastRate:  fastVal,
        firstRate: firstVal,
        overRate:  0,
        minGv:     r.min_gv ?? 0,
        minDirect: r.min_direct_referral ?? 0,
        salesRuleId: salesRule?.id ?? "", refRuleId: refRule?.id ?? "",
        fastRuleId: fastRule?.id ?? "", firstRuleId: firstRule?.id ?? "", overRuleId: "",
        salesTierId: sTier?.id ?? "", refTierId: rTier?.id ?? "",
        fastTierId: fTier?.id ?? "", firstTierId: ftTier?.id ?? "", overTierId: "",
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
      { id: draft.fastTierId,  rule_id: draft.fastRuleId,  rank_level: draft.rankLevel, rate: draft.fastRate },
      { id: draft.firstTierId, rule_id: draft.firstRuleId, rank_level: draft.rankLevel, rate: draft.firstRate },
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

  const [showGuide, setShowGuide] = useState(false);
  // 총 수당 재원 = 회사가 창업비에서 배분하는 전체 비율 (관리자 기준 55%)
  // 판권 + 관리비용 + 패스트스타트 + 팀원첫모집 + 풀5% + 회사재량1%
  const totalBudget = 55;

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>수당 플랜</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>직급별 수당 비율과 승급 조건을 관리합니다</p>
          </div>
          {/* 수당 설명서 버튼 */}
          <Link href="/commission-guide" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "999px",
            background: "rgba(201,168,76,0.1)",
            border: "1.5px solid rgba(201,168,76,0.35)",
            color: "#C9A84C", cursor: "pointer", fontSize: "12px", fontWeight: 700,
            textDecoration: "none", transition: "all 0.2s",
          }}>
            <FileText size={14} />
            수당 설명서
          </Link>
          {/* 가이드 버튼 — 애니메이션 펄스 */}
          <button onClick={() => setShowGuide(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "999px",
            background: "linear-gradient(135deg, rgba(108,71,255,0.15), rgba(167,139,250,0.1))",
            border: "1.5px solid rgba(108,71,255,0.35)",
            color: "#6C47FF", cursor: "pointer", fontSize: "12px", fontWeight: 700,
            boxShadow: "0 0 0 0 rgba(108,71,255,0.4)",
            animation: "guidePulse 2s infinite",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(108,71,255,0.2)"; (e.currentTarget as HTMLElement).style.animation = "none"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(108,71,255,0.15), rgba(167,139,250,0.1))"; (e.currentTarget as HTMLElement).style.animation = "guidePulse 2s infinite"; }}
          >
            <HelpCircle size={14} />
            사용 가이드
          </button>
          <style>{`
            @keyframes guidePulse {
              0%   { box-shadow: 0 0 0 0 rgba(108,71,255,0.4); }
              60%  { box-shadow: 0 0 0 8px rgba(108,71,255,0); }
              100% { box-shadow: 0 0 0 0 rgba(108,71,255,0); }
            }
          `}</style>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThemeToggle size="sm" />
          {/* 총 재원 뱃지 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "12px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>총 수당 재원</span>
          <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--gold)" }}>{totalBudget}%</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>관리자 / 회원 54%</span>
          <div style={{ width: "80px", height: "6px", background: "var(--bg-border)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "100%", background: "var(--gold)", borderRadius: "3px", transition: "width 0.3s" }} />
          </div>
          </div>
        </div>
      </div>

      {showGuide && <PlanGuideModal onClose={() => setShowGuide(false)} />}

      {/* ── 직급별 수당 카드 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {plans.map((p) => {
          const rs = RANK_STYLE[p.rankLevel] ?? RANK_STYLE[1];
          const isEditing = editing === p.rankLevel;
          const cur = isEditing && draft ? draft : p;
          const total = cur.salesRate + cur.refRate + cur.fastRate + cur.firstRate;

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
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "20px" }}>{rs.icon}</span>
                    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: rs.badge, color: rs.main }}>
                      {p.rankLevel === 1 ? "MEMBER" : p.rankLevel === 2 ? "MANAGER" : "DIRECTOR"}
                    </span>
                  </div>
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
                  ...(p.rankLevel >= 2 ? [
                    { key: "refRate"   as const, ...ITEM_COLORS.ref },
                    { key: "fastRate"  as const, ...ITEM_COLORS.fast },
                    { key: "firstRate" as const, ...ITEM_COLORS.first },
                  ] : []),
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <input type="number" min={0} step={1000000} value={cur.minGv} onChange={(e) => updateDraft("minGv", Number(e.target.value))}
                            style={{ width: "100px", padding: "5px 7px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, background: "var(--bg)", border: `1.5px solid ${rs.main}`, color: rs.main, outline: "none" }} />
                          <span style={{ fontSize: "12px", color: rs.main, fontWeight: 600 }}>원</span>
                        </div>
                        {cur.minGv > 0 && <span style={{ fontSize: "11px", fontWeight: 700, color: rs.main, padding: "2px 8px", background: `${rs.main}15`, borderRadius: "6px", display: "inline-block" }}>{cur.minGv.toLocaleString("ko-KR")}원</span>}
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
                { label: "① 판권 (소개수수료)", key: "salesRate" as const, color: "#4FA3E8" },
                { label: "② 관리비용 (오버라이드)", key: "refRate" as const, color: "#EF9F27" },
                { label: "③ 패스트 스타트", key: "fastRate" as const, color: "#10B981" },
                { label: "④ 팀원 첫모집", key: "firstRate" as const, color: "#F472B6" },
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
                  const total = p.salesRate + p.refRate + p.fastRate + p.firstRate;
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

      {/* ── 시뮬레이션은 별도 페이지로 이동 ── */}
      <a href="/simulation" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", borderRadius: "16px", background: "rgba(167,139,250,0.08)", border: "1.5px solid rgba(167,139,250,0.35)", cursor: "pointer", textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calculator size={18} color="#A78BFA" />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#A78BFA", margin: 0 }}>수당 시뮬레이션</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>창업비 기준 예상 수당 계산 — 시뮬레이션 페이지에서 확인</p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
      </a>
    </div>
  );
}
