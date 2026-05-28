"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, Users, Zap, Award, ChevronUp } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface PlanData {
  name: string; level: number; color: string;
  salesRate: number; refRate: number; overRate: number;
  minGv: number; minDirect: number;
}

const STYLES: Record<number, {
  main: string; dark: string; glow: string;
  grad: string; badge: string; label: string;
}> = {
  1: { main: "#4FA3E8", dark: "#1A6DB5", glow: "rgba(79,163,232,0.4)",
       grad: "linear-gradient(135deg,#1A3A5C,#1A5C8A)", badge: "PARTNER", label: "파트너" },
  2: { main: "#F5A623", dark: "#B87A10", glow: "rgba(245,166,35,0.4)",
       grad: "linear-gradient(135deg,#3D2800,#6B4500)", badge: "MANAGER", label: "매니저" },
  3: { main: "#E8599A", dark: "#A0245E", glow: "rgba(232,89,154,0.4)",
       grad: "linear-gradient(135deg,#3D0A20,#7A1540)", badge: "DIRECTOR", label: "디렉터" },
};

export default function CommissionPlanModal({ onClose }: { onClose: () => void }) {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(10000000);

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
      const sRule = rList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 0 && !r.is_volume_only);
      const rRule = rList.find(r => r.rule_type === "REFERRAL" && r.target_depth_from === 1 && !r.is_volume_only);
      const oRule = rList.find(r => r.rule_type === "TEAM" && !r.is_volume_only);
      setPlans((ranks ?? []).map((r: any) => ({
        name: r.name, level: r.level, color: r.color,
        salesRate: sRule?.tiers?.find((t: any) => t.rank_level === r.level)?.rate ?? 0,
        refRate:   rRule?.tiers?.find((t: any) => t.rank_level === r.level)?.rate ?? 0,
        overRate:  r.level >= 2 ? (oRule?.tiers?.find((t: any) => t.rank_level === r.level)?.rate ?? 0) : 0,
        minGv: r.min_gv ?? 0, minDirect: r.min_direct_referral ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (n: number) => n >= 100000000 ? `${(n/100000000).toFixed(0)}억` : n >= 10000000 ? `${(n/10000000).toFixed(0)}천만` : n >= 10000 ? `${(n/10000).toFixed(0)}만` : `${n.toLocaleString()}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "16px", overflowY: "auto",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "960px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Commission Structure</p>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>수당 플랜</h2>
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.6)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
          ><X size={16} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.4)" }}>불러오는 중...</div>
        ) : (
          <>
            {/* 직급 카드 3개 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              {plans.map((p) => {
                const s = STYLES[p.level] ?? STYLES[1];
                const total = p.salesRate + p.refRate + p.overRate;
                return (
                  <div key={p.level} style={{
                    background: s.grad,
                    border: `1px solid ${s.main}44`,
                    borderRadius: "24px", padding: "28px 24px",
                    position: "relative", overflow: "hidden",
                    boxShadow: `0 0 40px ${s.glow}`,
                  }}>
                    {/* 배경 글로우 */}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: s.main, opacity: 0.08, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: s.dark, opacity: 0.15, pointerEvents: "none" }} />

                    {/* 뱃지 + 직급명 */}
                    <div style={{ position: "relative" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", color: s.main, background: `${s.main}20`, border: `1px solid ${s.main}44`, marginBottom: "10px" }}>{s.badge}</span>
                      <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "26px", fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>{p.name}</h3>

                      {/* 합계 % 대형 표시 */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                        <span style={{ fontFamily: "Syne,sans-serif", fontSize: "56px", fontWeight: 900, color: s.main, lineHeight: 1 }}>{total}</span>
                        <span style={{ fontSize: "24px", fontWeight: 700, color: s.main, opacity: 0.8 }}>%</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginLeft: "8px", alignSelf: "center" }}>총 수당률</span>
                      </div>

                      {/* 수당 항목 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px" }}>
                        {[
                          { label: "① 내 판매 수당", val: p.salesRate, color: "#4FA3E8" },
                          { label: "② 추천 수당",    val: p.refRate,   color: "#F5A623" },
                          { label: "③ 오버라이딩",  val: p.overRate,  color: "#E8599A", hide: p.level < 2 },
                        ].map(({ label, val, color, hide }) => hide ? null : (
                          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: `${Math.max(val * 2.5, 4)}px`, height: "4px", borderRadius: "2px", background: color, opacity: 0.7 }} />
                              <span style={{ fontSize: "16px", fontWeight: 800, color, minWidth: "40px", textAlign: "right" }}>{val > 0 ? `${val}%` : "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 승급 조건 */}
                      <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>승급 조건</p>
                        {p.level === 1 ? (
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>5만원 이상 구매 후 즉시</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>직접 추천</span>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: s.main }}>{p.minDirect}명 이상</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>누적 매출</span>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: s.main }}>{fmt(p.minGv)}원 달성</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 마케팅 지원비 5% */}
            <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "20px", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={18} color="#A78BFA" />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#A78BFA", margin: 0 }}>마케팅 지원비 5%</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>전체 월 매출에서 별도 적립 — 총 수당 재원 55% 구성</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>월매출 기준</span>
                  <input type="number" value={totalSales} onChange={e => setTotalSales(Number(e.target.value))}
                    style={{ width: "110px", padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(167,139,250,0.3)", color: "#A78BFA", fontSize: "13px", fontWeight: 700, outline: "none", textAlign: "right" }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>원</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                  { label: "매니저 풀", pct: 2, color: "#F5A623", icon: "👔", desc: "매니저 전원 N분의1 균등" },
                  { label: "디렉터 풀", pct: 2, color: "#E8599A", icon: "👑", desc: "디렉터 전원 N분의1 균등" },
                  { label: "관리자 재량", pct: 1, color: "#A78BFA", icon: "🎯", desc: "추첨·이벤트·특별 지급" },
                ].map(({ label, pct, color, icon, desc }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, borderRadius: "14px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "20px" }}>{icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color }}>{label}</span>
                      <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: `${color}20`, color, border: `1px solid ${color}33` }}>{pct}%</span>
                    </div>
                    <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color, marginBottom: "4px" }}>
                      {(totalSales * pct / 100).toLocaleString()}원
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>마케팅 지원비 합계 (5%)</span>
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "#A78BFA" }}>{(totalSales * 5 / 100).toLocaleString()}원</span>
              </div>
            </div>

            {/* 하단 안내 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                추천 수당 · 오버라이딩은 직접 추천한 사람의 판매분에서만 발생 &nbsp;|&nbsp; 직급 미활동 3개월 지속 시 하위 직급 조정
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <span style={{ fontSize: "12px", color: "rgba(201,168,76,0.8)" }}>총 수당 재원</span>
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: "16px", fontWeight: 800, color: "#C9A84C" }}>55%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
