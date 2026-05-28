"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  TrendingUp, Users, Wallet, Zap, Target, Award,
  ChevronRight, RotateCcw, Calculator,
} from "lucide-react";

interface Tier { rank_level: number; rate: number; }
interface Rule { id: string; name: string; rule_type: string; target_depth_from: number; is_volume_only: boolean; calc_type: string; tiers: Tier[]; }
interface Rank { id: string; code: string; name: string; level: number; color: string; }

const RANK_COLORS: Record<number, { main: string; bg: string; glow: string }> = {
  1: { main: "#378ADD", bg: "rgba(55,138,221,0.12)", glow: "rgba(55,138,221,0.3)" },
  2: { main: "#EF9F27", bg: "rgba(239,159,39,0.12)",  glow: "rgba(239,159,39,0.3)" },
  3: { main: "#D4537E", bg: "rgba(212,83,126,0.12)",  glow: "rgba(212,83,126,0.3)" },
};

function Slider({ label, value, min, max, step, unit, onChange, color }: any) {
  const pct = Math.min(100, ((value - min) / (max - min)) * 100);
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: 800, color }}>
          {unit === "원" ? formatKRW(value) : `${value.toLocaleString()}${unit}`}
        </span>
      </div>
      <div style={{ position: "relative", height: "6px", background: "var(--bg-border)", borderRadius: "3px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: "3px", transition: "width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }}
        />
        <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: color, border: "3px solid var(--bg-surface)", boxShadow: `0 0 8px ${color}`, pointerEvents: "none", transition: "left 0.1s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{unit === "원" ? formatKRW(min) : `${min}${unit}`}</span>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{unit === "원" ? formatKRW(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function ResultCard({ label, amount, color, bg, glow, sub }: any) {
  return (
    <div style={{ background: bg, border: `1px solid ${glow}`, borderRadius: "16px", padding: "18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -20, bottom: -20, width: 80, height: 80, borderRadius: "50%", background: color, opacity: 0.08 }} />
      <p style={{ fontSize: "11px", color, fontWeight: 700, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color }}>{formatKRW(amount)}</p>
      {sub && <p style={{ fontSize: "11px", color, opacity: 0.7, marginTop: "2px" }}>{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px" }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill ?? p.color, fontWeight: 600 }}>{p.name}: {formatKRW(p.value)}</p>
      ))}
    </div>
  );
}

export default function SimulationPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  // 슬라이더 입력값
  const [mySales, setMySales]           = useState(1000000);
  const [directCount, setDirectCount]   = useState(3);
  const [directAvgSales, setDirectAvgSales] = useState(500000);
  const [teamSales, setTeamSales]       = useState(3000000);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const [{ data: rankData }, { data: ruleData }] = await Promise.all([
        supabase.from("ranks").select("id, code, name, level, color").order("level"),
        supabase.from("commission_rules").select("id, name, rule_type, target_depth_from, is_volume_only, calc_type, tiers:commission_tiers(rank_level, rate)").eq("is_active", true),
      ]);
      setRanks(rankData ?? []);
      setRules((ruleData as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // 직급별 수당 계산
  const calcForLevel = useCallback((level: number) => {
    const directRefSales = directCount * directAvgSales;

    // ① 내 판매 수당
    const salesRule = rules.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 0 && !r.is_volume_only);
    const salesRate = salesRule?.tiers?.find(t => t.rank_level === level)?.rate ?? 0;
    const salesComm = Math.floor(mySales * salesRate / 100);

    // ② 추천 수당
    const refRule = rules.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 1 && !r.is_volume_only);
    const refRate = refRule?.tiers?.find(t => t.rank_level === level)?.rate ?? 0;
    const refComm = Math.floor(directRefSales * refRate / 100);

    // ③ 오버라이딩 (매니저 level>=2)
    const overRule = rules.find(r => r.rule_type === "TEAM" && !r.is_volume_only);
    const overRate = level >= 2 ? (overRule?.tiers?.find(t => t.rank_level === level)?.rate ?? 0) : 0;
    const overComm = Math.floor(teamSales * overRate / 100);

    const total = salesComm + refComm + overComm;
    const tax = Math.floor(total * 0.033);
    return { salesComm, refComm, overComm, total, net: total - tax, salesRate, refRate, overRate };
  }, [rules, mySales, directCount, directAvgSales, teamSales]);

  const result = calcForLevel(selectedLevel);
  const rc = RANK_COLORS[selectedLevel] ?? RANK_COLORS[1];
  const selectedRank = ranks.find(r => r.level === selectedLevel);

  // 직급별 비교 데이터
  const compareData = ranks.map(r => {
    const c = calcForLevel(r.level);
    return { name: r.name, 판매수당: c.salesComm, 추천수당: c.refComm, 오버라이딩: c.overComm, total: c.total, color: r.color };
  });

  // 파이 차트 데이터
  const pieData = [
    { name: "내 판매 수당", value: result.salesComm, color: "#378ADD" },
    { name: "추천 수당",    value: result.refComm,   color: "#EF9F27" },
    { name: "오버라이딩",  value: result.overComm,  color: "#D4537E" },
  ].filter(d => d.value > 0);

  // 목표 시나리오
  const scenarios = [500000, 1000000, 2000000, 3000000, 5000000].map(sales => {
    const r = calcForLevel(selectedLevel);
    const ratio = sales / mySales;
    return {
      label: formatKRW(sales),
      total: Math.floor(result.total * ratio),
      net: Math.floor(result.net * ratio),
    };
  });

  function reset() {
    setMySales(1000000); setDirectCount(3);
    setDirectAvgSales(500000); setTeamSales(3000000);
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "12px" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--bg-border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calculator size={22} color="var(--gold)" /> 수당 시뮬레이션
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>실제 수당 플랜 기준 — 직급·매출·조직 규모별 수익 예측</p>
        </div>
        <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
          <RotateCcw size={13} /> 초기화
        </button>
      </div>

      {/* 직급 선택 */}
      <div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>직급 선택</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
          {ranks.map((r) => {
            const rc2 = RANK_COLORS[r.level] ?? { main: r.color, bg: `${r.color}22`, glow: `${r.color}44` };
            const active = selectedLevel === r.level;
            const c = calcForLevel(r.level);
            return (
              <button key={r.id} onClick={() => setSelectedLevel(r.level)} style={{
                padding: "16px 14px", borderRadius: "16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                background: active ? rc2.bg : "var(--bg-elevated)",
                border: `2px solid ${active ? rc2.main : "var(--bg-border)"}`,
                boxShadow: active ? `0 0 20px ${rc2.glow}` : "none",
                transform: active ? "translateY(-2px)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: rc2.main, boxShadow: active ? `0 0 6px ${rc2.main}` : "none" }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: active ? rc2.main : "var(--text-primary)" }}>{r.name}</span>
                </div>
                <p style={{ fontSize: "11px", color: active ? rc2.main : "var(--text-muted)", opacity: 0.8 }}>합계 수당률</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: rc2.main, marginTop: "2px" }}>
                  {(calcForLevel(r.level).salesRate + calcForLevel(r.level).refRate + calcForLevel(r.level).overRate).toFixed(0)}%
                </p>
                <p style={{ fontSize: "11px", color: active ? rc2.main : "var(--text-muted)", marginTop: "2px", opacity: 0.7 }}>
                  예상 {formatKRW(c.total)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 메인 2열 */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "20px" }} className="max-lg:block max-lg:space-y-5">

        {/* 좌측 — 입력 슬라이더 */}
        <div style={{ background: "var(--bg-elevated)", border: `1px solid ${rc.glow}`, borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: rc.main, opacity: 0.06 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: rc.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={17} color={rc.main} />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>매출 조건 설정</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selectedRank?.name} 기준</p>
            </div>
          </div>

          <Slider label="내 직접 판매 매출" value={mySales} min={0} max={10000000} step={100000} unit="원" onChange={setMySales} color={rc.main} />

          <div style={{ height: "1px", background: "var(--bg-border)", margin: "16px 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
            <Users size={14} color="#EF9F27" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>직접 추천 조직</span>
          </div>

          <Slider label="직접 추천 인원" value={directCount} min={0} max={30} step={1} unit="명" onChange={setDirectCount} color="#EF9F27" />
          <Slider label="추천인 인당 평균 매출" value={directAvgSales} min={0} max={3000000} step={50000} unit="원" onChange={setDirectAvgSales} color="#EF9F27" />

          {selectedLevel >= 2 && (
            <>
              <div style={{ height: "1px", background: "var(--bg-border)", margin: "16px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                <Zap size={14} color="#D4537E" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>오버라이딩 (팀 매출)</span>
              </div>
              <Slider label="산하 팀 전체 매출" value={teamSales} min={0} max={20000000} step={500000} unit="원" onChange={setTeamSales} color="#D4537E" />
            </>
          )}

          {/* 수당률 표 */}
          <div style={{ marginTop: "18px", background: "var(--bg)", borderRadius: "12px", padding: "14px", border: "1px solid var(--bg-border)" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "10px" }}>적용 수당률 ({selectedRank?.name})</p>
            {[
              { label: "① 내 판매 수당", rate: result.salesRate, color: "#378ADD" },
              { label: "② 추천 수당",    rate: result.refRate,   color: "#EF9F27" },
              { label: "③ 오버라이딩",  rate: result.overRate,  color: "#D4537E" },
            ].map(({ label, rate, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, background: `${color}18`, color, border: `1px solid ${color}33` }}>
                  {rate}%
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--bg-border)", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>합계</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: rc.main }}>{(result.salesRate + result.refRate + result.overRate).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* 우측 — 결과 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* 수당 결과 카드 4개 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            <ResultCard label="① 내 판매 수당" amount={result.salesComm} color="#378ADD" bg="rgba(55,138,221,0.08)" glow="rgba(55,138,221,0.25)" sub={`${result.salesRate}% 적용`} />
            <ResultCard label="② 추천 수당" amount={result.refComm} color="#EF9F27" bg="rgba(239,159,39,0.08)" glow="rgba(239,159,39,0.25)" sub={`${directCount}명 × ${result.refRate}%`} />
            <ResultCard label="③ 오버라이딩" amount={result.overComm} color="#D4537E" bg="rgba(212,83,126,0.08)" glow="rgba(212,83,126,0.25)" sub={selectedLevel >= 2 ? `${result.overRate}% 적용` : "매니저 이상"} />
            <ResultCard label="월 합계 수당" amount={result.total} color={rc.main} bg={rc.bg} glow={rc.glow} sub={`세후 ${formatKRW(result.net)}`} />
          </div>

          {/* 세전/세후 강조 */}
          <div style={{ background: `linear-gradient(135deg, ${rc.bg}, rgba(0,0,0,0.05))`, border: `1px solid ${rc.glow}`, borderRadius: "18px", padding: "20px", display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: "0", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>월 수당 (세전)</p>
              <p style={{ fontFamily: "Syne,sans-serif", fontSize: "28px", fontWeight: 800, color: rc.main }}>{formatKRW(result.total)}</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>연간 {formatKRW(result.total * 12)}</p>
            </div>
            <div style={{ width: "1px", background: "var(--bg-border)", height: "60px", margin: "0 auto" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>월 실수령 (3.3% 공제)</p>
              <p style={{ fontFamily: "Syne,sans-serif", fontSize: "28px", fontWeight: 800, color: "var(--emerald)" }}>{formatKRW(result.net)}</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>연간 {formatKRW(result.net * 12)}</p>
            </div>
          </div>

          {/* 수당 구성 파이 + 직급 비교 바 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="max-md:block max-md:space-y-3">
            {/* 파이 차트 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>수당 구성 비율</p>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={4}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatKRW(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {pieData.map((d) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "2px", background: d.color, flexShrink: 0 }} />
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: d.color }}>{formatKRW(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>매출 입력 필요</div>
              )}
            </div>

            {/* 직급 비교 바 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>직급별 수당 비교</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={compareData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="판매수당" stackId="a" fill="#378ADD" radius={[0,0,0,0]} />
                  <Bar dataKey="추천수당" stackId="a" fill="#EF9F27" />
                  <Bar dataKey="오버라이딩" stackId="a" fill="#D4537E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 매출 시나리오 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Target size={18} color="#A78BFA" />
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>내 판매 매출별 예상 수당 시나리오</p>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>({selectedRank?.name} 기준, 조직 조건 동일)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                {["내 판매 매출", "판매 수당", "추천 수당", "오버라이딩", "월 합계", "월 실수령"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[500000, 1000000, 2000000, 3000000, 5000000, 10000000].map((sales, i) => {
                const salesComm = Math.floor(sales * result.salesRate / 100);
                const refComm2 = Math.floor(directCount * directAvgSales * result.refRate / 100);
                const overComm2 = Math.floor(teamSales * result.overRate / 100);
                const total2 = salesComm + refComm2 + overComm2;
                const net2 = Math.floor(total2 * 0.967);
                const isSelected = sales === mySales;
                const colors = ["#378ADD","#EF9F27","#D4537E","#A78BFA","#10B981","#F59E0B"];
                return (
                  <tr key={sales} style={{ borderBottom: "1px solid var(--bg-border)", background: isSelected ? `${rc.bg}` : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.03)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 3, height: 18, borderRadius: "2px", background: colors[i] }} />
                        <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? rc.main : "var(--text-primary)" }}>{formatKRW(sales)}</span>
                        {isSelected && <span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: rc.bg, color: rc.main, border: `1px solid ${rc.glow}` }}>현재</span>}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "#378ADD", fontWeight: 500 }}>{formatKRW(salesComm)}</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "#EF9F27", fontWeight: 500 }}>{formatKRW(refComm2)}</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "#D4537E", fontWeight: 500 }}>{formatKRW(overComm2)}</td>
                    <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(total2)}</td>
                    <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: 700, color: "var(--emerald)" }}>{formatKRW(net2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 조직 성장 시나리오 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Award size={18} color="#EF9F27" />
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>직추천 인원별 예상 수당 시나리오</p>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>({selectedRank?.name}, 내 매출 및 인당 매출 동일)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {[1, 3, 5, 10, 15, 20].map((cnt, i) => {
            const refComm3 = Math.floor(cnt * directAvgSales * result.refRate / 100);
            const total3 = result.salesComm + refComm3 + result.overComm;
            const colors = ["rgba(55,138,221,", "rgba(239,159,39,", "rgba(212,83,126,", "rgba(167,139,250,", "rgba(16,185,129,", "rgba(245,158,11,"];
            const textColors = ["#378ADD", "#EF9F27", "#D4537E", "#A78BFA", "#10B981", "#F59E0B"];
            return (
              <div key={cnt} style={{ background: `${colors[i]}0.08)`, border: `1px solid ${colors[i]}0.25)`, borderRadius: "14px", padding: "14px", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${colors[i]}0.15)`, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={16} color={textColors[i]} />
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>직추천 {cnt}명</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: textColors[i] }}>{formatKRW(total3)}</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>실수령 {formatKRW(Math.floor(total3 * 0.967))}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
