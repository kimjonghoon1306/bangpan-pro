"use client";

import { useState } from "react";
import { Wallet, Download, TrendingUp, Check, ArrowUpRight } from "lucide-react";
import { formatKRW } from "@/lib/utils";

const MONTHS = ["2024.07", "2024.06", "2024.05", "2024.04"];

const DATA: Record<string, any[]> = {
  "2024.07": [
    { date: "07.01", rule: "직접추천수당", source: "박지현", depth: 1, base: 320000, rate: 10, amount: 32000, type: "추천" },
    { date: "07.01", rule: "직접추천수당", source: "오민정", depth: 1, base: 450000, rate: 10, amount: 45000, type: "추천" },
    { date: "07.01", rule: "간접수당", source: "이준호", depth: 2, base: 120000, rate: 5, amount: 6000, type: "간접" },
    { date: "07.01", rule: "간접수당", source: "강동현", depth: 2, base: 80000, rate: 5, amount: 4000, type: "간접" },
  ],
  "2024.06": [
    { date: "06.30", rule: "직접추천수당", source: "한상욱", depth: 1, base: 450000, rate: 10, amount: 45000, type: "추천" },
    { date: "06.30", rule: "직급수당", source: "—", depth: 0, base: 0, rate: 0, amount: 50000, type: "직급" },
    { date: "06.29", rule: "직접추천수당", source: "박지현", depth: 1, base: 280000, rate: 10, amount: 28000, type: "추천" },
  ],
};

const TYPE_COLOR: Record<string, { color: string; bg: string }> = {
  추천: { color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  간접: { color: "#4F8EF7", bg: "rgba(79,142,247,0.12)" },
  직급: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
};

export default function EarningsPage() {
  const [month, setMonth] = useState("2024.07");
  const items = DATA[month] || [];
  const total = items.reduce((s, c) => s + c.amount, 0);
  const net = Math.floor(total * 0.967);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">

      {/* 좌측 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>수당 내역</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>월별 수당 상세</p>
          </div>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "9px 14px" }}>
            <Download size={14} /> 지급명세서
          </button>
        </div>

        {/* 월 선택 */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
          {MONTHS.map((m) => (
            <button key={m} onClick={() => setMonth(m)} style={{
              padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
              background: month === m ? "rgba(201,168,76,0.15)" : "var(--bg-elevated)",
              border: `1px solid ${month === m ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
              color: month === m ? "var(--gold)" : "var(--text-secondary)",
            }}>{m}</button>
          ))}
        </div>

        {/* 수당 내역 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          {items.length === 0 ? (
            <p style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>수당 내역이 없습니다.</p>
          ) : (
            <>
              {/* PC 테이블 */}
              <div className="hidden md:block" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                      {["유형","규칙","발생 회원","단계","기준금액","비율","수당액","세후"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c, i) => {
                      const tc = TYPE_COLOR[c.type] || TYPE_COLOR["추천"];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: tc.bg, color: tc.color }}>{c.type}</span>
                          </td>
                          <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap" }}>{c.rule}</td>
                          <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>{c.source}</td>
                          <td style={{ padding: "11px 14px", fontSize: "12px", color: "var(--text-muted)" }}>{c.depth > 0 ? `${c.depth}단계` : "—"}</td>
                          <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{c.base > 0 ? `${c.base.toLocaleString()}원` : "—"}</td>
                          <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--gold)", fontWeight: 600 }}>{c.rate > 0 ? `${c.rate}%` : "—"}</td>
                          <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{c.amount.toLocaleString()}원</td>
                          <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--emerald)", whiteSpace: "nowrap" }}>{Math.floor(c.amount*0.967).toLocaleString()}원</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 모바일 */}
              <div className="md:hidden">
                {items.map((c, i) => {
                  const tc = TYPE_COLOR[c.type] || TYPE_COLOR["추천"];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderBottom: i < items.length-1 ? "1px solid var(--bg-border)" : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "9px", background: tc.bg, border: `1px solid ${tc.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: tc.color, flexShrink: 0 }}>{c.type}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.rule}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.source !== "—" ? `${c.source} · ` : ""}{c.depth > 0 ? `${c.depth}단계` : ""} {c.date}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)" }}>{c.amount.toLocaleString()}원</p>
                        <p style={{ fontSize: "11px", color: "var(--emerald)" }}>세후 {Math.floor(c.amount*0.967).toLocaleString()}원</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 우측 — 요약 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* 이달 합계 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
          <svg style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.05 }} width="100" height="100" viewBox="0 0 100 100"><circle cx="80" cy="80" r="60" fill="var(--gold)" /></svg>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Wallet size={16} color="var(--gold)" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{month} 수당 합계</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>총 수당</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{formatKRW(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>원천징수 (3.3%)</span>
              <span style={{ fontSize: "13px", color: "#F87171" }}>-{formatKRW(total - net)}</span>
            </div>
            <div style={{ height: "1px", background: "var(--bg-border)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>실지급액</span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--gold)", fontFamily: "Syne,sans-serif" }}>{formatKRW(net)}</span>
            </div>
          </div>
        </div>

        {/* 수당 유형별 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>유형별 합계</h3>
          {Object.entries(TYPE_COLOR).map(([type, tc]) => {
            const typeTotal = items.filter(c => c.type === type).reduce((s, c) => s + c.amount, 0);
            if (typeTotal === 0) return null;
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--bg-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tc.color, display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{type}수당</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: tc.color }}>{formatKRW(typeTotal)}</span>
              </div>
            );
          })}
        </div>

        {/* 월별 비교 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>월별 현황</h3>
          {MONTHS.map((m) => {
            const mTotal = (DATA[m] || []).reduce((s, c) => s + c.amount, 0);
            const max = Math.max(...MONTHS.map(mo => (DATA[mo] || []).reduce((s, c) => s + c.amount, 0)));
            return (
              <div key={m} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: m === month ? "var(--gold)" : "var(--text-secondary)" }}>{formatKRW(mTotal)}</span>
                </div>
                <div style={{ height: "5px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${max > 0 ? (mTotal / max) * 100 : 0}%`, background: m === month ? "var(--gold)" : "var(--bg-border)", borderRadius: "3px", transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
