"use client";

import { useState } from "react";
import { formatKRW } from "@/lib/utils";
import { RotateCcw, Calculator, Users, Zap, TrendingUp, CheckCircle } from "lucide-react";

// ─── 색상 상수 (전체 앱 통일) ──────────────────────────
const CLR = {
  member:   { main: "#6B7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)",  label: "멤버",   icon: "👤", fee: 50000,    base: 50000    },
  manager:  { main: "#378ADD", bg: "rgba(55,138,221,0.12)",  border: "rgba(55,138,221,0.3)",   label: "매니저", icon: "👔", fee: 3300000,  base: 3000000  },
  director: { main: "#E8599A", bg: "rgba(232,89,154,0.12)",  border: "rgba(232,89,154,0.3)",   label: "디렉터", icon: "👑", fee: 5500000,  base: 5000000  },
};
const COMM = {
  sales:    { color: "#4FA3E8", label: "① 직판 수당 32%"          },
  ref:      { color: "#EF9F27", label: "② 추천 오버라이드 10%"    },
  fast:     { color: "#10B981", label: "④ 패스트 스타트 +5%"      },
  first:    { color: "#F472B6", label: "⑤ 팀원 첫모집 보너스 +3%" },
  pool:     { color: "#A78BFA", label: "⑥/⑦ 매니저·디렉터 풀 2%"  },
};

type MyRank = "manager" | "director";

export default function SimulationPage() {
  // ─── 입력값 ────────────────────────────────────────
  const [myRank, setMyRank]         = useState<MyRank>("manager");
  const [mgrCount, setMgrCount]     = useState(3);   // 직추천 매니저 수
  const [dirCount, setDirCount]     = useState(0);   // 직추천 디렉터 수
  const [fastDone, setFastDone]     = useState(false); // 패스트스타트 달성
  const [firstCount, setFirstCount] = useState(1);   // 팀원 첫모집 성공 건수
  const [totalFee, setTotalFee]     = useState(50000000); // 월 전체 창업비 총액
  const [mgrTotal, setMgrTotal]     = useState(10);  // 전체 매니저 인원
  const [dirTotal, setDirTotal]     = useState(3);   // 전체 디렉터 인원

  const r = CLR[myRank];
  const base = r.base;

  // ─── 수당 계산 ─────────────────────────────────────
  const sales   = Math.floor(base * 0.32);
  const refAmt  = Math.floor((mgrCount * 3000000 + dirCount * 5000000) * 0.10);
  const fastAmt = fastDone ? Math.floor(base * 0.05) : 0;
  const firstAmt = Math.floor(firstCount * 3000000 * 0.03); // 기본 매니저 기준
  const poolAmt = myRank === "manager"
    ? Math.floor(totalFee * 0.02 / Math.max(mgrTotal, 1))
    : Math.floor(totalFee * 0.02 / Math.max(dirTotal, 1));

  const total = sales + refAmt + fastAmt + firstAmt + poolAmt;
  const tax   = Math.floor(total * 0.033);
  const net   = total - tax;

  const items = [
    { key: "sales",  amount: sales,    ...COMM.sales  },
    { key: "ref",    amount: refAmt,   ...COMM.ref    },
    ...(fastDone       ? [{ key: "fast",  amount: fastAmt,  ...COMM.fast  }] : []),
    ...(firstCount > 0 ? [{ key: "first", amount: firstAmt, ...COMM.first }] : []),
    { key: "pool",   amount: poolAmt,  ...COMM.pool   },
  ];

  function reset() {
    setMyRank("manager"); setMgrCount(3); setDirCount(0);
    setFastDone(false); setFirstCount(1); setTotalFee(50000000);
    setMgrTotal(10); setDirTotal(3);
  }

  // ─── 비교 시나리오 (직추천 수별) ────────────────────
  const compareData = [1, 2, 3, 5, 7, 10].map(n => ({
    n, total: Math.floor(sales + n * 3000000 * 0.10 + (fastDone ? Math.floor(base * 0.05) : 0) + firstAmt + poolAmt),
  }));

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calculator size={22} color="var(--gold)" /> 수당 시뮬레이션
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>창업비 기준 · 실제 수당 플랜으로 계산</p>
        </div>
        <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
          <RotateCcw size={13} /> 초기화
        </button>
      </div>

      {/* ─── 메인 2열 ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px" }} className="max-lg:block max-lg:space-y-5">

        {/* 좌측 — 입력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* 내 직급 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>내 직급 선택</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {(["manager", "director"] as MyRank[]).map(k => {
                const c = CLR[k];
                const active = myRank === k;
                return (
                  <button key={k} onClick={() => setMyRank(k)} style={{
                    padding: "16px 12px", borderRadius: "14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                    background: active ? c.bg : "var(--bg)",
                    border: `2px solid ${active ? c.main : "var(--bg-border)"}`,
                    boxShadow: active ? `0 0 20px ${c.bg}` : "none",
                  }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>{c.icon}</div>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: active ? c.main : "var(--text-primary)", margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: "11px", color: active ? c.main : "var(--text-muted)", margin: "3px 0 0", opacity: 0.8 }}>
                      창업비 {k === "manager" ? "330만원" : "550만원"}
                    </p>
                    {active && (
                      <div style={{ marginTop: "8px", padding: "3px 8px", borderRadius: "6px", background: `${c.main}20`, display: "inline-block" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: c.main }}>직판 {Math.floor(c.base * 0.32 / 10000)}만원 즉시</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 직추천 모집 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Users size={15} color="#EF9F27" />
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>직추천 모집</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>각 창업비 × 10%</span>
            </div>

            {/* 매니저 모집 */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>👔</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>매니저 모집</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>× 30만원</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#378ADD", minWidth: "40px", textAlign: "right" }}>{mgrCount}명</span>
                </div>
              </div>
              <input type="range" min={0} max={20} step={1} value={mgrCount} onChange={e => setMgrCount(+e.target.value)}
                style={{ width: "100%", accentColor: "#378ADD", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>0명</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#378ADD" }}>{formatKRW(mgrCount * 300000)}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>20명</span>
              </div>
            </div>

            {/* 디렉터 모집 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>👑</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>디렉터 모집</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>× 50만원</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#E8599A", minWidth: "40px", textAlign: "right" }}>{dirCount}명</span>
                </div>
              </div>
              <input type="range" min={0} max={10} step={1} value={dirCount} onChange={e => setDirCount(+e.target.value)}
                style={{ width: "100%", accentColor: "#E8599A", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>0명</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#E8599A" }}>{formatKRW(dirCount * 500000)}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>10명</span>
              </div>
            </div>
          </div>

          {/* 보너스 조건 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>추가 보너스</p>

            {/* 패스트 스타트 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "12px", background: fastDone ? "rgba(16,185,129,0.08)" : "var(--bg)", border: `1px solid ${fastDone ? "#10B981" : "var(--bg-border)"}`, marginBottom: "10px", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setFastDone(!fastDone)}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🚀</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: fastDone ? "#10B981" : "var(--text-primary)", margin: 0 }}>패스트 스타트 달성</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>가입 후 90일 내 미션 달성</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981" }}>+{formatKRW(fastAmt)}</span>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: fastDone ? "#10B981" : "var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  {fastDone && <CheckCircle size={14} color="#fff" />}
                </div>
              </div>
            </div>

            {/* 팀원 첫모집 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>🎯</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>팀원 첫모집 성공</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>× 9만원</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#F472B6", minWidth: "30px", textAlign: "right" }}>{firstCount}건</span>
                </div>
              </div>
              <input type="range" min={0} max={20} step={1} value={firstCount} onChange={e => setFirstCount(+e.target.value)}
                style={{ width: "100%", accentColor: "#F472B6", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>0건</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#F472B6" }}>{formatKRW(firstAmt)}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>20건</span>
              </div>
            </div>
          </div>

          {/* 풀 배분 설정 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Zap size={14} color="#A78BFA" />
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>풀 배분 설정</p>
            </div>
            {[
              { label: "월 전체 창업비 총액", value: totalFee, set: setTotalFee, max: 500000000, step: 5000000, color: "#A78BFA", unit: "원" },
              { label: "전체 매니저 수",       value: mgrTotal, set: setMgrTotal, max: 100,       step: 1,       color: "#378ADD", unit: "명" },
              { label: "전체 디렉터 수",       value: dirTotal, set: setDirTotal, max: 50,        step: 1,       color: "#E8599A", unit: "명" },
            ].map(({ label, value, set, max, step, color, unit }) => (
              <div key={label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color }}>{unit === "원" ? formatKRW(value) : `${value}${unit}`}</span>
                </div>
                <input type="range" min={0} max={max} step={step} value={value} onChange={e => set(+e.target.value)}
                  style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
              </div>
            ))}
            <div style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", marginTop: "4px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 4px" }}>내 풀 배분 예상</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 800, color: "#A78BFA", margin: 0 }}>{formatKRW(poolAmt)}</p>
            </div>
          </div>
        </div>

        {/* 우측 — 결과 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* 최종 수당 히어로 */}
          <div style={{ background: r.bg, border: `2px solid ${r.main}`, borderRadius: "20px", padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: r.main, opacity: 0.08 }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: "0", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>월 예상 수당 (세전)</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "36px", fontWeight: 900, color: r.main, lineHeight: 1 }}>{formatKRW(total)}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>연간 {formatKRW(total * 12)}</p>
              </div>
              <div style={{ width: "1px", background: "var(--bg-border)", height: "70px", margin: "0 auto" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>실수령 (3.3% 공제)</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "36px", fontWeight: 900, color: "var(--emerald)", lineHeight: 1 }}>{formatKRW(net)}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>세금 {formatKRW(tax)}</p>
              </div>
            </div>
          </div>

          {/* 수당 항목별 바 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>수당 항목 상세</p>
            {items.map(({ key, label, color, amount }) => {
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "3px", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pct.toFixed(0)}%</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color, minWidth: "80px", textAlign: "right" }}>{formatKRW(amount)}</span>
                    </div>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-border)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: "1px solid var(--bg-border)", marginTop: "14px", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>합계</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 800, color: r.main }}>{formatKRW(total)}</span>
            </div>
          </div>

          {/* 직추천 수별 비교 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <TrendingUp size={15} color="#EF9F27" />
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>직추천 매니저 수별 예상 수당</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>현재 조건 기준</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {compareData.map(({ n, total: t }) => {
                const isNow = n === mgrCount;
                const maxTotal = compareData[compareData.length - 1].total || 1;
                const barW = (t / maxTotal) * 100;
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: isNow ? 800 : 500, color: isNow ? "#EF9F27" : "var(--text-muted)", minWidth: "30px", textAlign: "right" }}>{n}명</span>
                    <div style={{ flex: 1, height: "20px", background: "var(--bg-border)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${barW}%`, background: isNow ? "#EF9F27" : "rgba(239,159,39,0.4)", borderRadius: "4px", transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: isNow ? 800 : 500, color: isNow ? "#EF9F27" : "var(--text-secondary)", minWidth: "70px", textAlign: "right" }}>{formatKRW(t)}</span>
                    {isNow && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "999px", background: "rgba(239,159,39,0.15)", color: "#EF9F27", border: "1px solid rgba(239,159,39,0.3)", fontWeight: 700, flexShrink: 0 }}>현재</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 창업비별 수당 한눈에 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bg-border)" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>창업비별 수당 기준표</p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>수당 항목</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>👔 매니저</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>👑 디렉터</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "직판 수당 (32%)", mgr: 960000, dir: 1600000, color: "#4FA3E8" },
                  { label: "추천 오버라이드 (10%)", mgr: 300000, dir: 500000, color: "#EF9F27", sub: "1명 기준" },
                  { label: "패스트 스타트 (5%)", mgr: 150000, dir: 250000, color: "#10B981", sub: "90일 달성 시" },
                  { label: "팀원 첫모집 (3%)", mgr: 90000, dir: 150000, color: "#F472B6", sub: "1건 기준" },
                ].map(({ label, mgr, dir, color, sub }) => (
                  <tr key={label} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "2px", background: color, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: "12px", color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>{label}</p>
                          {sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#378ADD" }}>{formatKRW(mgr)}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#E8599A" }}>{formatKRW(dir)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
