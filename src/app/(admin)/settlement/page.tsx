"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, CheckCircle, Download, Wallet, TrendingUp, Users, AlertCircle, Check, Clock, HelpCircle, BookOpen, X, Calendar, FileText, CreditCard } from "lucide-react";
import { Skeleton, SkeletonTable, SkeletonStat, SkeletonStyle } from "@/components/ui/Skeleton";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "진행중",   color: "var(--gold)",    bg: "rgba(201,168,76,0.12)" },
  CALCULATING: { label: "계산중",   color: "#93C5FD",        bg: "rgba(79,142,247,0.12)" },
  CLOSED:      { label: "확정",     color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
  PAID:        { label: "지급완료", color: "var(--text-muted)", bg: "var(--bg-border)" },
};

// ─── 정산 관리 사용 가이드 ────────────────────────────
const GUIDE_ITEMS = [
  {
    icon: Calendar,
    color: "#C9A84C",
    bg: "rgba(201,168,76,0.10)",
    title: "정산 기간 선택",
    desc: "월별 정산 기간을 선택합니다. 매달 자동으로 새 기간이 생성됩니다.",
    steps: [
      "상단 기간 카드(예: 2025.06)를 클릭해 해당 월 선택",
      "상태가 진행중이면 아직 수당 계산 전 / 확정이면 계산 완료",
      "기간이 없으면 자동으로 이번 달 기간이 생성됩니다",
      "여러 달을 비교하려면 다른 기간 카드를 클릭하면 됩니다",
    ],
  },
  {
    icon: Play,
    color: "#6C47FF",
    bg: "rgba(108,71,255,0.10)",
    title: "수당 계산 실행",
    desc: "선택한 기간의 신규 창업(가입)을 집계해 판권·관리비용을 자동 계산합니다.",
    steps: [
      "정산할 기간을 먼저 선택합니다",
      "우측 상단 '수당 계산 실행' 버튼 클릭",
      "판권(추천자) · 관리비용(추천자의 추천자)이 회원별로 자동 계산됩니다",
      "계산 완료 후 '수당 내역' 탭에서 회원별 상세 확인 가능",
      "재계산이 필요하면 다시 버튼을 클릭하면 덮어씁니다",
    ],
  },
  {
    icon: FileText,
    color: "#00C896",
    bg: "rgba(0,200,150,0.10)",
    title: "수당 내역 확인",
    desc: "계산된 수당을 회원별로 상세하게 확인합니다.",
    steps: [
      "수당 계산 실행 후 '수당 내역' 탭 클릭",
      "회원명 · 적용 규칙 · 기준금액 · 비율 · 수당액 · 세후금액 확인",
      "1단계(직추천)=판권 / 2단계(추천인의 추천인)=관리비용으로 구분 표시",
      "이상한 금액이 있으면 수당 플랜 페이지에서 비율을 확인하세요",
    ],
  },
  {
    icon: CreditCard,
    color: "#E8599A",
    bg: "rgba(232,89,154,0.10)",
    title: "지급 내역 & 지급 처리",
    desc: "회원별 최종 지급액을 확인하고 지급을 확정합니다.",
    steps: [
      "'지급 내역' 탭에서 회원별 세전 · 세후 · 계좌 확인",
      "원천징수 3.3%가 자동으로 공제됩니다",
      "계좌 정보가 비어있는 회원은 회원관리에서 먼저 등록해주세요",
      "하단 '정산 확정 및 지급 처리' 버튼 클릭 → 상태가 지급완료로 변경",
      "지급명세서 버튼으로 엑셀 다운로드 가능",
    ],
  },
  {
    icon: AlertCircle,
    color: "#FF9500",
    bg: "rgba(255,149,0,0.10)",
    title: "주의 사항",
    desc: "정산 처리 전 반드시 확인하세요.",
    steps: [
      "지급완료 상태로 변경되면 되돌릴 수 없습니다",
      "수당 계산은 마감·정산 페이지의 일일 마감 후 실행하는 것을 권장합니다",
      "공유수당(매니저 풀 2% / 디렉터 풀 2% / 재량 1%)은 마감·정산 페이지에서 별도 처리합니다",
      "창업비 기준: 멤버 5만 / 매니저 300만 / 디렉터 500만. 판권은 추천자(매니저25%·디렉터32%), 관리비용은 추천자의 추천자(판권의 10%)에게 지급됩니다",
    ],
  },
];

function SettlementGuideModal({ onClose }: { onClose: () => void }) {
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
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(0,200,150,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#00C896" />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>정산 관리 사용 가이드</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>각 기능을 클릭해 사용법을 확인하세요</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={15} />
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "6px", padding: "16px 24px 0", overflowX: "auto", flexWrap: "wrap" }}>
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
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px", borderRadius: "16px", background: g.bg, border: `1px solid ${g.color}33`, marginBottom: "18px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "12px", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <g.icon size={22} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: g.color, margin: "0 0 4px" }}>{g.title}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
                </div>
              </div>
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

export default function SettlementPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [tab, setTab] = useState<"commission" | "payout">("commission");
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPeriods = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    // 현재 열린 기간 없으면 자동 생성
    const now = new Date();
    const { data: existing } = await supabase.from("settlement_periods").select("*").eq("year", now.getFullYear()).eq("month", now.getMonth() + 1).single();
    if (!existing) {
      await supabase.from("settlement_periods").insert({ year: now.getFullYear(), month: now.getMonth() + 1, status: "OPEN", total_bv: 0, total_commission: 0 });
    }
    const { data } = await supabase.from("settlement_periods").select("*").order("year", { ascending: false }).order("month", { ascending: false }).limit(6);
    setPeriods(data ?? []);
    if (data?.length) setSelected(data[0]);
    setLoading(false);
  }, []);

  useEffect(() => { loadPeriods(); }, [loadPeriods]);

  useEffect(() => {
    if (!selected) return;
    async function loadDetail() {
      const supabase = createBrowserSupabaseClient();
      const [{ data: comms }, { data: pays }] = await Promise.all([
        supabase.from("commissions").select("*, member:members(name, member_code), rule:commission_rules(name, rule_type)").eq("period_id", selected.id).order("amount", { ascending: false }).limit(100),
        supabase.from("payouts").select("*, member:members(name, member_code, bank_name, bank_account)").eq("period_id", selected.id).order("net_amount", { ascending: false }),
      ]);
      setCommissions((comms as any) ?? []);
      setPayouts((pays as any) ?? []);
    }
    loadDetail();
  }, [selected]);

  async function handleCalculate() {
    if (!selected) return;
    setCalculating(true);
    const supabase = createBrowserSupabaseClient();

    // 해당 기간 신규 창업(가입) 회원 조회 — 창업비 기반 정산
    const start = new Date(selected.year, selected.month - 1, 1).toISOString().split("T")[0];
    const end = new Date(selected.year, selected.month, 1).toISOString().split("T")[0];
    const { data: newMembers } = await supabase
      .from("members")
      .select("id, sponsor_id, joined_at, rank:ranks(level)")
      .eq("is_admin", false)
      .gte("joined_at", start)
      .lt("joined_at", end);

    // 직급별 창업비 (실 기준 — 부가세 제외)
    const FEE: Record<number, number> = { 1: 50000, 2: 3000000, 3: 5000000 };
    // 판권율 (추천자 직급 기준): 멤버 5% / 매니저 25% / 디렉터 32%
    const DEFAULT_BANKWON: Record<number, number> = { 1: 5, 2: 25, 3: 32 };
    const OVERRIDE_RATE = 10; // 관리비용 = 추천자 판권의 10%

    // 수당 룰 로드
    const { data: rules } = await supabase.from("commission_rules").select("*, tiers:commission_tiers(rank_level, rate)").eq("is_active", true);
    const ruleList = (rules as any[]) ?? [];
    // 판권 룰 (REFERRAL depth 1 = 추천자가 받음)
    const bankwonRule = ruleList.find((r: any) => r.rule_type === "REFERRAL" && r.target_depth_from === 1 && !r.is_volume_only)
                      ?? ruleList.find((r: any) => r.rule_type === "REFERRAL" && !r.is_volume_only);
    // 관리비용 룰 (MATCHING = 오버라이드)
    const overrideRule = ruleList.find((r: any) => r.rule_type === "MATCHING" && !r.is_volume_only);

    function bankwonRate(level: number) {
      return bankwonRule?.tiers?.find((t: any) => t.rank_level === level)?.rate ?? DEFAULT_BANKWON[level] ?? 0;
    }

    // 회원별 수당 계산
    const commInserts: any[] = [];
    let totalFee = 0;

    for (const m of newMembers ?? []) {
      const level = (m as any)?.rank?.level ?? 1;
      const fee = FEE[level] ?? 0;
      totalFee += fee;

      const sponsorId = (m as any)?.sponsor_id;
      if (!sponsorId) continue;

      // 추천자 정보
      const { data: sponsor } = await supabase.from("members").select("id, sponsor_id, rank:ranks(level)").eq("id", sponsorId).single();
      const sponsorLevel = (sponsor as any)?.rank?.level ?? 1;

      // ① 판권 (소개수수료) → 추천자 1회. 추천자 직급 기준 비율
      const bw = bankwonRate(sponsorLevel);
      const bankwonAmount = Math.floor(fee * bw / 100);
      if (bankwonRule?.id && bankwonAmount > 0) {
        commInserts.push({ period_id: selected.id, member_id: sponsorId, rule_id: bankwonRule.id, source_member_id: (m as any).id, depth: 1, base_amount: fee, rate: bw, amount: bankwonAmount, status: "CALCULATED", note: "판권" });
      }

      // ② 관리비용 → 추천자의 추천자에게 (매니저 이상). 추천자가 받은 판권 × 10%
      const grandId = (sponsor as any)?.sponsor_id;
      if (grandId && bankwonAmount > 0 && overrideRule?.id) {
        const { data: grand } = await supabase.from("members").select("id, rank:ranks(level)").eq("id", grandId).single();
        const grandLevel = (grand as any)?.rank?.level ?? 1;
        if (grandLevel >= 2) {
          const ovAmount = Math.floor(bankwonAmount * OVERRIDE_RATE / 100);
          if (ovAmount > 0) {
            commInserts.push({ period_id: selected.id, member_id: grandId, rule_id: overrideRule.id, source_member_id: (m as any).id, depth: 2, base_amount: bankwonAmount, rate: OVERRIDE_RATE, amount: ovAmount, status: "CALCULATED", note: "관리비용" });
          }
        }
      }
    }
    const totalBv = totalFee; // 정산 기준 = 총 창업비

    // 기존 계산 삭제 후 재삽입
    await supabase.from("commissions").delete().eq("period_id", selected.id);
    if (commInserts.length > 0) await supabase.from("commissions").insert(commInserts);

    const totalComm = commInserts.reduce((s, c) => s + c.amount, 0);

    // 회원별 합산 → payouts 생성
    const memberComm: Record<string, number> = {};
    commInserts.forEach(c => { memberComm[c.member_id] = (memberComm[c.member_id] ?? 0) + c.amount; });
    await supabase.from("payouts").delete().eq("period_id", selected.id);
    const payoutInserts = await Promise.all(Object.entries(memberComm).map(async ([memberId, gross]) => {
      const { data: m } = await supabase.from("members").select("bank_name, bank_account, bank_holder").eq("id", memberId).single();
      const tax = Math.floor(gross * 0.033);
      return { period_id: selected.id, member_id: memberId, gross_amount: gross, tax_rate: 0.033, tax_amount: tax, net_amount: gross - tax, bank_name: m?.bank_name, bank_account: m?.bank_account, bank_holder: m?.bank_holder, status: "PENDING" };
    }));
    if (payoutInserts.length > 0) await supabase.from("payouts").insert(payoutInserts);

    await supabase.from("settlement_periods").update({ status: "CLOSED", total_bv: totalBv, total_commission: totalComm, calculated_at: new Date().toISOString() }).eq("id", selected.id);

    setCalculating(false);
    setCalculated(true);
    loadPeriods();
  }

  async function handlePay() {
    if (!selected || !confirm("정산을 확정하고 지급 처리하시겠습니까?")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from("payouts").update({ status: "COMPLETED", paid_at: new Date().toISOString() }).eq("period_id", selected.id);
    await supabase.from("settlement_periods").update({ status: "PAID", paid_at: new Date().toISOString() }).eq("id", selected.id);
    loadPeriods();
  }

  const totalGross = payouts.reduce((s, p) => s + p.gross_amount, 0);
  const totalTax = payouts.reduce((s, p) => s + p.tax_amount, 0);
  const totalNet = payouts.reduce((s, p) => s + p.net_amount, 0);

  const [showGuide, setShowGuide] = useState(false);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>정산 관리</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>수당 계산 및 지급 처리</p>
          </div>
          <button onClick={() => setShowGuide(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "999px",
            background: "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,200,150,0.08))",
            border: "1.5px solid rgba(0,200,150,0.35)",
            color: "#00C896", cursor: "pointer", fontSize: "12px", fontWeight: 700,
            animation: "guidePulse2 2s infinite", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,200,150,0.2)"; (e.currentTarget as HTMLElement).style.animation = "none"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,200,150,0.08))"; (e.currentTarget as HTMLElement).style.animation = "guidePulse2 2s infinite"; }}
          >
            <HelpCircle size={14} />
            사용 가이드
          </button>
          <style>{`
            @keyframes guidePulse2 {
              0%   { box-shadow: 0 0 0 0 rgba(0,200,150,0.4); }
              60%  { box-shadow: 0 0 0 8px rgba(0,200,150,0); }
              100% { box-shadow: 0 0 0 0 rgba(0,200,150,0); }
            }
          `}</style>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}><Download size={14} /> 지급명세서</button>
          <button onClick={handleCalculate} disabled={calculating || selected?.status === "PAID"} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            {calculating ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />계산중...</> : <><Play size={14} /> 수당 계산 실행</>}
          </button>
        </div>
      </div>

      {showGuide && <SettlementGuideModal onClose={() => setShowGuide(false)} />}

      {calculated && <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><Check size={14} /> 수당 계산 완료. 내역 확인 후 지급 처리하세요.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
        {loading ? <div style={{ gridColumn: "1/-1", padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div> : periods.map((p) => {
          const S = STATUS_MAP[p.status] ?? STATUS_MAP["OPEN"];
          const active = selected?.id === p.id;
          return (
            <button key={p.id} onClick={() => { setSelected(p); setCalculated(false); }} style={{ background: active ? "rgba(201,168,76,0.08)" : "var(--bg-elevated)", border: `1px solid ${active ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`, borderRadius: "14px", padding: "14px", textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{p.year}.{String(p.month).padStart(2,"0")}</span>
                <span style={{ padding: "2px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: S.bg, color: S.color }}>{S.label}</span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>창업비 {p.total_bv.toLocaleString()}</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", marginTop: "2px" }}>{formatKRW(p.total_commission)}</p>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
        {[
          { label: "총 수당", value: formatKRW(totalGross), icon: Wallet, color: "var(--gold)" },
          { label: "원천징수 (3.3%)", value: formatKRW(totalTax), icon: AlertCircle, color: "#F87171" },
          { label: "실지급 합계", value: formatKRW(totalNet), icon: TrendingUp, color: "var(--emerald)" },
          { label: "지급 대상자", value: `${payouts.length}명`, icon: Users, color: "#4F8EF7" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={18} color={s.color} />
            <div><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p><p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {[{id:"commission",label:"수당 내역"},{id:"payout",label:"지급 내역"}].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: "8px 20px", borderRadius: "9px", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s", background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent", border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", color: tab === t.id ? "var(--gold)" : "var(--text-secondary)" }}>{t.label}</button>
        ))}
      </div>

      {tab === "commission" && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          {commissions.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>수당 계산을 실행해주세요</div> : (
            <>
              <div className="hidden md:block" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid var(--bg-border)" }}>{["회원","규칙","단계","기준금액","비율","수당액","세후"].map(h => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {commissions.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                        <td style={{ padding: "11px 14px" }}><p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{(c.member as any)?.name}</p><p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{(c.member as any)?.member_code}</p></td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{(c.rule as any)?.name}</td>
                        <td style={{ padding: "11px 14px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: "var(--bg-border)", color: "var(--text-secondary)" }}>{c.depth}단계</span></td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{c.base_amount.toLocaleString()}원</td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--gold)" }}>{c.rate}%</td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{c.amount.toLocaleString()}원</td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--emerald)", whiteSpace: "nowrap" }}>{Math.floor(c.amount*0.967).toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden">
                {commissions.map((c) => (
                  <div key={c.id} style={{ padding: "12px 14px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: 1 }}><p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{(c.member as any)?.name}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{(c.rule as any)?.name} · {c.rate}%</p></div>
                    <div style={{ textAlign: "right" }}><p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>{c.amount.toLocaleString()}원</p><p style={{ fontSize: "11px", color: "var(--emerald)" }}>세후 {Math.floor(c.amount*0.967).toLocaleString()}원</p></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "payout" && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          {payouts.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>수당 계산 후 지급 내역이 생성됩니다</div> : (
            <>
              <div className="hidden md:block" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid var(--bg-border)" }}>{["회원","총 수당","원천징수","실지급액","계좌"].map(h => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {payouts.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                        <td style={{ padding: "11px 14px" }}><p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{(p.member as any)?.name}</p><p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{(p.member as any)?.member_code}</p></td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{p.gross_amount.toLocaleString()}원</td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", color: "#F87171", whiteSpace: "nowrap" }}>-{p.tax_amount.toLocaleString()}원</td>
                        <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: 800, color: "var(--gold)", whiteSpace: "nowrap" }}>{p.net_amount.toLocaleString()}원</td>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>{(p.member as any)?.bank_name} {(p.member as any)?.bank_account}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden">
                {payouts.map((p) => (
                  <div key={p.id} style={{ padding: "12px 14px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div><p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{(p.member as any)?.name}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{(p.member as any)?.bank_name} {(p.member as any)?.bank_account}</p></div>
                    <div style={{ textAlign: "right" }}><p style={{ fontSize: "15px", fontWeight: 800, color: "var(--gold)" }}>{p.net_amount.toLocaleString()}원</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>세전 {p.gross_amount.toLocaleString()}원</p></div>
                  </div>
                ))}
              </div>
              {selected?.status !== "PAID" && (
                <div style={{ padding: "14px 16px", borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handlePay} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--emerald)", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                    <CheckCircle size={15} /> 정산 확정 및 지급 처리
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
