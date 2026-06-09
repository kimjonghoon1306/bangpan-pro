"use client";

import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface PlanData {
  name: string; level: number; color: string;
  salesRate: number; refRate: number;
  minGv: number; minDirect: number;
}

const STYLES: Record<number, {
  main: string; dark: string; glow: string;
  grad: string; badge: string; label: string; icon: string;
}> = {
  1: { main: "#6B7280", dark: "#374151", glow: "rgba(107,114,128,0.3)",
       grad: "linear-gradient(135deg,#1a1c1e,#2a2d30)", badge: "MEMBER", label: "멤버", icon: "👤" },
  2: { main: "#378ADD", dark: "#1A4A7A", glow: "rgba(55,138,221,0.4)",
       grad: "linear-gradient(135deg,#0d1f35,#1a3a5c)", badge: "MANAGER", label: "매니저", icon: "👔" },
  3: { main: "#E8599A", dark: "#7A1540", glow: "rgba(232,89,154,0.4)",
       grad: "linear-gradient(135deg,#2a0516,#4a0d28)", badge: "DIRECTOR", label: "디렉터", icon: "👑" },
};

const FEE: Record<number, { label: string; amount: number; base: number }> = {
  1: { label: "5만원+",   amount:  50000, base:  50000 },
  2: { label: "330만원",  amount: 3300000, base: 3000000 },
  3: { label: "550만원",  amount: 5500000, base: 5000000 },
};

export default function CommissionPlanModal({ onClose }: { onClose: () => void }) {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(50000000);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const [{ data: ranks }, { data: rules }] = await Promise.all([
        supabase.from("ranks").select("*").order("level"),
        supabase.from("commission_rules")
          .select("rule_type, target_depth_from, is_volume_only, tiers:commission_tiers(rank_level, rate)")
          .eq("is_active", true),
      ]);
      const rList = (rules as any[]) ?? [];
      const sRule = rList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 0);
      const rRule = rList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 1);

      const DEF: Record<number, { s: number; r: number }> = {
        1: { s: 32, r: 5 },
        2: { s: 32, r: 10 },
        3: { s: 32, r: 10 },
      };
      const rankList = (ranks && ranks.length > 0) ? ranks : [
        { name: "멤버",   level: 1, color: "#6B7280", min_gv: 50000,     min_direct_referral: 0 },
        { name: "매니저", level: 2, color: "#378ADD", min_gv: 10000000,  min_direct_referral: 0 },
        { name: "디렉터", level: 3, color: "#E8599A", min_gv: 20000000,  min_direct_referral: 3 },
      ];
      setPlans(rankList.map((r: any) => {
        const d = DEF[r.level] ?? { s: 0, r: 0 };
        return {
          name: r.name, level: r.level, color: r.color,
          salesRate: sRule?.tiers?.find((t: any) => t.rank_level === r.level)?.rate ?? d.s,
          refRate:   rRule?.tiers?.find((t: any) => t.rank_level === r.level)?.rate ?? d.r,
          minGv: r.min_gv ?? 0, minDirect: r.min_direct_referral ?? 0,
        };
      }));
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (n: number) =>
    n >= 100000000 ? `${(n / 100000000).toFixed(0)}억`
    : n >= 10000000 ? `${(n / 10000000).toFixed(0)}천만`
    : n >= 10000 ? `${(n / 10000).toFixed(0)}만`
    : `${n.toLocaleString()}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(14px)",
      overflowY: "auto", padding: "20px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "1000px", margin: "0 auto",
        background: "var(--bg-surface)", borderRadius: "24px", padding: "24px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
              1대 오버라이드 구조 · 총 수당 재원 54%
            </p>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>수당 플랜</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle size="sm" />
            <button onClick={onClose} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)",
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 핵심 룰 배너 */}
        <div style={{
          background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.3)",
          borderRadius: "14px", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "22px" }}>⚡</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700", margin: 0 }}>직추천 1대에서만 수당 발생</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
              내가 직접 추천한 창업자 창업비에서만 · 그 이하 조직은 각자 수령
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>불러오는 중...</div>
        ) : (<>

          {/* 직급 카드 3개 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "16px" }}>
            {plans.map((p) => {
              const s = STYLES[p.level] ?? STYLES[1];
              const fee = FEE[p.level];
              const base = fee?.base ?? 0;
              const salesAmt = Math.floor(base * p.salesRate / 100);
              const refAmt   = Math.floor(base * p.refRate / 100);
              const fast     = Math.floor(base * 5 / 100);
              const first    = Math.floor(base * 3 / 100);

              return (
                <div key={p.level} style={{
                  background: s.grad,
                  border: `1px solid ${s.main}44`,
                  borderRadius: "24px", padding: "28px 24px",
                  position: "relative", overflow: "hidden",
                  boxShadow: `0 0 40px ${s.glow}`,
                }}>
                  <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: s.main, opacity: 0.06, pointerEvents: "none" }} />

                  {/* 아이콘 + 직급명 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "36px" }}>{s.icon}</span>
                    <div>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "999px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", color: s.main, background: `${s.main}20`, border: `1px solid ${s.main}40` }}>{s.badge}</span>
                      <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "#fff", margin: "2px 0 0" }}>{p.name}</h3>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>창업비</p>
                      <p style={{ fontSize: "16px", fontWeight: 800, color: s.main, margin: 0 }}>{fee?.label}</p>
                    </div>
                  </div>

                  {/* 수당 항목 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "18px 0" }}>
                    {[
                      { label: "① 직판 수당",        rate: p.salesRate, amt: salesAmt, color: "#4FA3E8", show: p.level >= 2 },
                      { label: "② 추천 오버라이드",   rate: p.refRate,   amt: refAmt,   color: "#F5A623", show: true },
                      { label: "④ 패스트 스타트",     rate: 5,           amt: fast,     color: "#10B981", show: p.level >= 2 },
                      { label: "⑤ 팀원 첫모집",       rate: 3,           amt: first,    color: "#F472B6", show: p.level >= 2 },
                    ].filter(i => i.show).map(({ label, rate, amt, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{amt > 0 ? `${amt.toLocaleString()}원` : ""}</span>
                          <span style={{ fontSize: "15px", fontWeight: 800, color, minWidth: "38px", textAlign: "right" }}>{rate > 0 ? `${rate}%` : "5%"}</span>
                        </div>
                      </div>
                    ))}
                    {/* 멤버는 소개 수당만 */}
                    {p.level === 1 && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>③ 창업자 소개 수당</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>매니저 15만 / 디렉터 25만</span>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#F5A623", minWidth: "38px", textAlign: "right" }}>5%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 승급 조건 */}
                  <div style={{ padding: "12px 14px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                      {p.level === 1 ? "가입 조건" : p.level === 2 ? "가입 조건 (또는 멤버 승급)" : "승급 조건"}
                    </p>
                    {p.level === 1 ? (
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>5만원 이상 구매 즉시</p>
                    ) : p.level === 2 ? (
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>소매 창업 330만원 <span style={{ color: "var(--text-muted)" }}>또는</span> 소개 누적 창업비 1,000만원</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>직추천 매니저</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: s.main }}>3명 이상</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>산하 전체 누적 매출</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: s.main }}>{fmt(p.minGv)}원</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>또는 도매 창업</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: s.main }}>550만원</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 수당 플랜 배분 바 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "20px", padding: "22px 24px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "14px", letterSpacing: "0.08em" }}>창업비 100% 배분 구조</p>
            <div style={{ display: "flex", height: "28px", borderRadius: "8px", overflow: "hidden", gap: "2px", marginBottom: "10px" }}>
              {[
                { label: "직판 32%",  w: 32, color: "#4FA3E8" },
                { label: "추천 10%",  w: 10, color: "#EF9F27" },
                { label: "패스트 5%", w: 5,  color: "#10B981" },
                { label: "팀원 3%",   w: 3,  color: "#F472B6" },
                { label: "풀 4%",     w: 4,  color: "#A78BFA" },
                { label: "회사 46%",  w: 46, color: "var(--bg-border)" },
              ].map(({ label, w, color }) => (
                <div key={label} style={{ width: `${w}%`, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: color.startsWith("rgba") ? "rgba(255,255,255,0.25)" : "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>
                  {w >= 5 ? label : ""}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#C9A84C" }}>수당 합계 54%</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>회사 수익 46%</span>
            </div>
          </div>

          {/* 5% 풀 */}
          <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "20px", padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Zap size={18} color="#A78BFA" />
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#A78BFA", margin: 0 }}>전체 창업비 매출 5% 풀</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>전체 창업비 4% 별도 적립 — 매니저·디렉터 균등 배분</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>월 창업비 총액</span>
                <input type="number" value={totalSales} onChange={e => setTotalSales(Number(e.target.value))}
                  style={{ width: "120px", padding: "6px 10px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid rgba(167,139,250,0.3)", color: "#A78BFA", fontSize: "13px", fontWeight: 700, outline: "none", textAlign: "right" }} />
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>원</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              {[
                { label: "매니저 풀", pct: 2, color: "#378ADD", icon: "👔", desc: "매니저 전원 N분의1 균등" },
                { label: "디렉터 풀", pct: 2, color: "#E8599A", icon: "👑", desc: "디렉터 전원 N분의1 균등" },
              ].map(({ label, pct, color, icon, desc }) => (
                <div key={label} style={{ background: "var(--bg-elevated)", border: `1px solid ${color}30`, borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color }}>{label}</span>
                    <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: `${color}20`, color, border: `1px solid ${color}30` }}>{pct}%</span>
                  </div>
                  <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color, marginBottom: "4px" }}>
                    {Math.floor(totalSales * pct / 100).toLocaleString()}원
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              수당은 직접 추천한 창업자 1대에서만 발생 · 승급은 산하 전체 볼륨 합산
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <span style={{ fontSize: "12px", color: "rgba(201,168,76,0.7)" }}>총 수당 재원</span>
              <span style={{ fontFamily: "Syne,sans-serif", fontSize: "16px", fontWeight: 800, color: "#C9A84C" }}>54%</span>
            </div>
          </div>

        </>)}
      </div>
    </div>
  );
}
