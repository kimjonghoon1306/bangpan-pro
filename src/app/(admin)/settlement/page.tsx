"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, CheckCircle, Download, Wallet, TrendingUp, Users, AlertCircle, Check, Clock } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "진행중",   color: "var(--gold)",    bg: "rgba(201,168,76,0.12)" },
  CALCULATING: { label: "계산중",   color: "#93C5FD",        bg: "rgba(79,142,247,0.12)" },
  CLOSED:      { label: "확정",     color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
  PAID:        { label: "지급완료", color: "var(--text-muted)", bg: "var(--bg-border)" },
};

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

    // 해당 기간 주문 BV 합산
    const start = new Date(selected.year, selected.month - 1, 1).toISOString();
    const end = new Date(selected.year, selected.month, 1).toISOString();
    const { data: orders } = await supabase.from("orders").select("total_bv, member_id").eq("status", "PAID").gte("paid_at", start).lt("paid_at", end);

    const totalBv = orders?.reduce((s: number, o: any) => s + o.total_bv, 0) ?? 0;

    // 수당 규칙 로드
    const { data: rules } = await supabase.from("commission_rules").select("*, tiers:commission_tiers(rank_level, rate)").eq("is_active", true);

    // 회원별 수당 계산 (REFERRAL/TEAM 규칙)
    const commInserts: any[] = [];
    for (const order of orders ?? []) {
      // 해당 회원 직급
      const { data: member } = await supabase.from("members").select("id, rank:ranks(level)").eq("id", order.member_id).single();
      const memberLevel = (member as any)?.rank?.level ?? 1;

      for (const rule of rules ?? []) {
        if (rule.rule_type === "REFERRAL" && rule.target_depth_from === 0) {
          // 내 판매 수당
          const tier = (rule.tiers as any[])?.find((t: any) => t.rank_level === memberLevel);
          if (tier) {
            commInserts.push({ period_id: selected.id, member_id: order.member_id, rule_id: rule.id, source_member_id: order.member_id, depth: 0, base_amount: order.total_bv, rate: tier.rate, amount: Math.floor(order.total_bv * tier.rate / 100), status: "CALCULATED" });
          }
        }
        if (rule.rule_type === "REFERRAL" && rule.target_depth_from === 1) {
          // 추천 수당 — 추천인 찾기
          const { data: sponsorMember } = await supabase.from("members").select("id, rank:ranks(level)").eq("id", order.member_id).single();
          const { data: sponsor } = await supabase.from("members").select("id, sponsor_id, rank:ranks(level)").eq("sponsor_id", order.member_id).single();
          if (sponsor) {
            const sponsorLevel = (sponsor as any)?.rank?.level ?? 1;
            const tier = (rule.tiers as any[])?.find((t: any) => t.rank_level === sponsorLevel);
            if (tier) {
              commInserts.push({ period_id: selected.id, member_id: (sponsor as any).id, rule_id: rule.id, source_member_id: order.member_id, depth: 1, base_amount: order.total_bv, rate: tier.rate, amount: Math.floor(order.total_bv * tier.rate / 100), status: "CALCULATED" });
            }
          }
        }
      }
    }

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

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>정산 관리</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>수당 계산 및 지급 처리</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}><Download size={14} /> 지급명세서</button>
          <button onClick={handleCalculate} disabled={calculating || selected?.status === "PAID"} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            {calculating ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />계산중...</> : <><Play size={14} /> 수당 계산 실행</>}
          </button>
        </div>
      </div>

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
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>BV {p.total_bv.toLocaleString()}</p>
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
