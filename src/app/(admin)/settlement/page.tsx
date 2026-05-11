"use client";

import { useState } from "react";
import {
  Play, CheckCircle, Download, Wallet,
  TrendingUp, Users, AlertCircle, Check,
  Clock, ChevronDown, ChevronRight,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";

const PERIODS = [
  { id: "1", year: 2024, month: 7, status: "OPEN",   total_bv: 284200, total_commission: 38420000 },
  { id: "2", year: 2024, month: 6, status: "PAID",   total_bv: 261800, total_commission: 35180000 },
  { id: "3", year: 2024, month: 5, status: "PAID",   total_bv: 248400, total_commission: 33240000 },
  { id: "4", year: 2024, month: 4, status: "PAID",   total_bv: 239600, total_commission: 31840000 },
  { id: "5", year: 2024, month: 3, status: "PAID",   total_bv: 228100, total_commission: 30480000 },
  { id: "6", year: 2024, month: 2, status: "PAID",   total_bv: 198400, total_commission: 26420000 },
];

const COMMISSIONS = [
  { member: "김민수",   code: "M-012847", rule: "직접추천수당", depth: 1, base: 850000,  rate: 10, amount: 85000 },
  { member: "오민정",   code: "M-012842", rule: "직접추천수당", depth: 1, base: 920000,  rate: 10, amount: 92000 },
  { member: "박지현",   code: "M-012846", rule: "직접추천수당", depth: 1, base: 320000,  rate: 10, amount: 32000 },
  { member: "김민수",   code: "M-012847", rule: "간접수당",     depth: 2, base: 320000,  rate: 5,  amount: 16000 },
  { member: "한상욱",   code: "M-012843", rule: "직접추천수당", depth: 1, base: 450000,  rate: 10, amount: 45000 },
  { member: "오민정",   code: "M-012842", rule: "간접수당",     depth: 2, base: 450000,  rate: 5,  amount: 22500 },
  { member: "이준호",   code: "M-012845", rule: "직접추천수당", depth: 1, base: 120000,  rate: 10, amount: 12000 },
];

const PAYOUTS = [
  { member: "오민정",   code: "M-012842", gross: 318000, tax: 10494, net: 307506, bank: "국민은행", account: "***-***-789012" },
  { member: "김민수",   code: "M-012847", gross: 247000, tax: 8151, net: 238849, bank: "신한은행", account: "***-***-456789" },
  { member: "한상욱",   code: "M-012843", gross: 142000, tax: 4686, net: 137314, bank: "우리은행", account: "***-***-123456" },
  { member: "박지현",   code: "M-012846", gross: 98000,  tax: 3234, net: 94766,  bank: "카카오뱅크", account: "***-***-987654" },
  { member: "이준호",   code: "M-012845", gross: 24000,  tax: 792,  net: 23208,  bank: "농협",     account: "***-***-654321" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  OPEN:        { label: "진행중",   color: "var(--gold)",    bg: "rgba(201,168,76,0.12)",  icon: Clock },
  CALCULATING: { label: "계산중",   color: "#93C5FD",        bg: "rgba(79,142,247,0.12)",  icon: Play },
  CLOSED:      { label: "확정",     color: "var(--emerald)", bg: "rgba(16,185,129,0.12)", icon: CheckCircle },
  PAID:        { label: "지급완료", color: "var(--text-muted)", bg: "var(--bg-border)",   icon: Check },
};

export default function SettlementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [tab, setTab] = useState<"commission"|"payout">("commission");
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const totalGross = PAYOUTS.reduce((s, p) => s + p.gross, 0);
  const totalTax   = PAYOUTS.reduce((s, p) => s + p.tax, 0);
  const totalNet   = PAYOUTS.reduce((s, p) => s + p.net, 0);

  async function handleCalculate() {
    setCalculating(true);
    await new Promise(r => setTimeout(r, 1800));
    setCalculating(false);
    setCalculated(true);
  }

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>정산 관리</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>수당 계산 및 지급 처리</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}>
            <Download size={14} /> 지급명세서
          </button>
          <button
            onClick={handleCalculate}
            disabled={calculating || selectedPeriod.status === "PAID"}
            className="btn-gold"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            {calculating
              ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #08080E", borderRadius: "50%", animation: "spin 1s linear infinite" }} />계산중...</>
              : <><Play size={14} /> 수당 계산 실행</>
            }
          </button>
        </div>
      </div>

      {calculated && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <Check size={14} /> 수당 계산이 완료되었습니다. 내역을 확인하고 지급 처리해주세요.
        </div>
      )}

      {/* 정산 기간 선택 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
        {PERIODS.map((p) => {
          const S = STATUS_MAP[p.status];
          const active = selectedPeriod.id === p.id;
          return (
            <button key={p.id} onClick={() => setSelectedPeriod(p)} style={{
              background: active ? "rgba(201,168,76,0.08)" : "var(--bg-elevated)",
              border: `1px solid ${active ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
              borderRadius: "14px", padding: "14px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {p.year}.{String(p.month).padStart(2,"0")}
                </span>
                <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: S.bg, color: S.color }}>{S.label}</span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>BV {p.total_bv.toLocaleString()}</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", marginTop: "2px" }}>{formatKRW(p.total_commission)}</p>
            </button>
          );
        })}
      </div>

      {/* 정산 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
        {[
          { label: "총 수당", value: formatKRW(totalGross), icon: Wallet, color: "var(--gold)" },
          { label: "원천징수 (3.3%)", value: formatKRW(totalTax), icon: AlertCircle, color: "#F87171" },
          { label: "실지급 합계", value: formatKRW(totalNet), icon: TrendingUp, color: "var(--emerald)" },
          { label: "지급 대상자", value: `${PAYOUTS.length}명`, icon: Users, color: "#4F8EF7" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={18} color={s.color} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {[{id:"commission",label:"수당 내역"},{id:"payout",label:"지급 내역"}].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: "8px 20px", borderRadius: "9px", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.15s",
            background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
            border: tab === t.id ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
            color: tab === t.id ? "var(--gold)" : "var(--text-secondary)",
          }}>{t.label}</button>
        ))}
      </div>

      {/* 수당 내역 테이블 */}
      {tab === "commission" && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          {/* PC */}
          <div className="hidden md:block" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["회원","규칙","단계","기준금액","비율","수당액","세후"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.member}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.code}</p>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{c.rule}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: "var(--bg-border)", color: "var(--text-secondary)" }}>{c.depth}단계</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{c.base.toLocaleString()}원</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--gold)" }}>{c.rate}%</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{c.amount.toLocaleString()}원</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--emerald)", whiteSpace: "nowrap" }}>{Math.floor(c.amount*0.967).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 모바일 */}
          <div className="md:hidden">
            {COMMISSIONS.map((c, i) => (
              <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.member}</span>
                    <span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "10px", background: "var(--bg-border)", color: "var(--text-muted)" }}>{c.depth}단계</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.rule} · {c.rate}%</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>{c.amount.toLocaleString()}원</p>
                  <p style={{ fontSize: "11px", color: "var(--emerald)" }}>세후 {Math.floor(c.amount*0.967).toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 지급 내역 */}
      {tab === "payout" && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          {/* PC */}
          <div className="hidden md:block" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["회원","총 수당","원천징수","실지급액","계좌"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{p.member}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{p.code}</p>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{p.gross.toLocaleString()}원</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "#F87171", whiteSpace: "nowrap" }}>-{p.tax.toLocaleString()}원</td>
                    <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: 800, color: "var(--gold)", whiteSpace: "nowrap" }}>{p.net.toLocaleString()}원</td>
                    <td style={{ padding: "11px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>{p.bank} {p.account}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 모바일 */}
          <div className="md:hidden">
            {PAYOUTS.map((p, i) => (
              <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{p.member}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.bank} {p.account}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--gold)" }}>{p.net.toLocaleString()}원</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>세전 {p.gross.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>

          {/* 지급 처리 버튼 */}
          {selectedPeriod.status !== "PAID" && (
            <div style={{ padding: "14px 16px", borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "flex-end" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--emerald)", cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "all 0.15s" }}>
                <CheckCircle size={15} /> 정산 확정 및 지급 처리
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
