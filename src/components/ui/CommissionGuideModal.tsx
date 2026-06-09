"use client";
import { useState } from "react";
import { X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const TABS = [
  { key: "structure",   label: "📊 조직도"    },
  { key: "commissions", label: "💰 수당 구조"  },
  { key: "scenarios",   label: "📈 수입 예시"  },
  { key: "promotion",   label: "🏆 승급 조건"  },
] as const;
type Tab = typeof TABS[number]["key"];

function Person({ emoji, label, badge, color, me, sub, small }: {
  emoji: string; label: string; badge: string; color: string;
  me?: boolean; sub?: string; small?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
      <div style={{
        width: small ? 44 : 58, height: small ? 44 : 58, borderRadius: "50%",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: small ? "22px" : "28px", position: "relative",
        border: me ? "3px solid #FFD700" : `2px solid ${color}`,
        boxShadow: me ? "0 0 16px rgba(255,215,0,0.5)" : "none", flexShrink: 0,
      }}>
        {emoji}
        {me && <div style={{ position: "absolute", top: -8, right: -8, background: "#FFD700", color: "#000", fontSize: "8px", fontWeight: 900, padding: "2px 5px", borderRadius: "999px" }}>나</div>}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "1px 7px", borderRadius: "999px", fontSize: "9px", fontWeight: 800, background: `${color}22`, color, border: `1px solid ${color}44`, marginBottom: "2px" }}>{badge}</div>
        <p style={{ fontSize: small ? "11px" : "12px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

const COMMISSIONS = [
  { no: "①", name: "판권 (소개수수료)", color: "#4FA3E8", icon: "💼",
    desc: "내가 누군가를 소개할 때 받는 1회성 수수료. 내 직급에 따라 비율이 다릅니다.",
    ex: "매니저가 소개 시 → 창업비 × 25%\n디렉터가 소개 시 → 창업비 × 32%",
    rate: "25%/32%" },
  { no: "②", name: "관리비용 (오버라이드)", color: "#EF9F27", icon: "🔄",
    desc: "내가 추천한 팀원이 활동하면서 받는 판권 수익의 10%를 관리비용으로 지속 수령합니다.",
    ex: "팀원이 300만 판권 수령 → 나: 30만원\n팀원이 160만 판권 수령 → 나: 16만원",
    rate: "10%" },
  { no: "③", name: "멤버 소개 수당", color: "#6B7280", icon: "👋",
    desc: "멤버가 창업자를 소개할 때만 적용되는 소개 수당입니다.",
    ex: "매니저 소개 → 300만 × 5% = 15만원\n디렉터 소개 → 500만 × 5% = 25만원",
    rate: "5%" },
  { no: "④", name: "패스트 스타트", color: "#10B981", icon: "🚀",
    desc: "가입 후 90일 내 목표 달성 시 추가 지급. 매니저와 디렉터 비율이 다릅니다.",
    ex: "매니저: 창업비 × 3% = 9만원\n디렉터: 창업비 × 5% = 25만원",
    rate: "+3%/+5%" },
  { no: "⑤", name: "팀원 첫모집 보너스", color: "#F472B6", icon: "🎯",
    desc: "내 직추천 팀원이 처음으로 새 창업자를 모집했을 때 받는 보너스입니다.",
    ex: "매니저: 창업비 × 2% = 6만원/건\n디렉터: 창업비 × 3% = 9~15만원/건",
    rate: "+2%/+3%" },
  { no: "⑥", name: "매니저 풀", color: "#378ADD", icon: "👔",
    desc: "월 전체 창업비 매출의 2%를 매니저 전원이 N분의1로 균등 배분합니다.",
    ex: "월 총 창업비 5,000만원 → 100만원 ÷ 매니저 수",
    rate: "2%" },
  { no: "⑦", name: "디렉터 풀", color: "#E8599A", icon: "👑",
    desc: "월 전체 창업비 매출의 2%를 디렉터 전원이 N분의1로 균등 배분합니다.",
    ex: "월 총 창업비 5,000만원 → 100만원 ÷ 디렉터 수",
    rate: "2%" },
];

const SCENARIOS = [
  {
    title: "🌱 입문 — 본인 창업 후 창업자 모집 시 수입",
    color: "#378ADD", rank: "매니저", basis: "창업비 300만원 — 본인 창업은 사업의 시작",
    items: [
      { label: "매니저 1명 모집 → 판권 25%",    amount: 750000, note: "300만 × 25% · 모집할 때마다 1회 발생" },
      { label: "관리비용 (팀원 판권×10%)",       amount:  75000, note: "팀원이 또 모집할 때마다 지속 발생" },
      { label: "패스트 스타트 3%",               amount:  90000, note: "가입 90일 내 목표 달성 시" },
    ],
    total: 915000,
    tip: "본인 창업은 사업의 시작입니다. 수입은 창업자를 모집해야 발생합니다.",
  },
  {
    title: "📈 성장 — 매니저 3명 소개",
    color: "#378ADD", rank: "매니저", basis: "창업비 300만원 기준",
    items: [
      { label: "판권 25% × 3명",        amount: 2250000, note: "300만 × 25% × 3" },
      { label: "관리비용 (팀원 판권×10%)", amount:  225000, note: "75만 × 10% × 3명" },
      { label: "팀원 첫모집 2% × 3건",   amount:  180000, note: "300만 × 2% × 3" },
      { label: "패스트 스타트 3%",       amount:   90000, note: "조건 달성 시" },
    ],
    total: 2745000,
  },
  {
    title: "💎 디렉터 — 팀 완성",
    color: "#E8599A", rank: "디렉터", basis: "창업비 500만원 기준",
    items: [
      { label: "판권 32% × 5명",          amount: 4000000, note: "500만 × 32% × 5" },
      { label: "관리비용 (팀원 판권×10%)", amount:  400000, note: "160만 × 10% × 5명" },
      { label: "팀원 첫모집 3% × 5건",    amount:  250000, note: "500만 × 3% × 5" },
      { label: "디렉터 풀 배분",           amount:  500000, note: "전체 매출 2% ÷ N명" },
    ],
    total: 5150000,
  },
];

export default function CommissionGuideModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("structure");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(14px)",
      overflowY: "auto", padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "680px", margin: "0 auto",
        background: "var(--bg-surface)", borderRadius: "24px", padding: "20px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>판권 + 관리비용 구조 · 총 수당 재원 54%</p>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>수당 플랜 설명서</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle size="sm" />
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
              background: tab === t.key ? "rgba(201,168,76,0.2)" : "var(--bg-elevated)",
              border: `1.5px solid ${tab === t.key ? "rgba(201,168,76,0.6)" : "var(--bg-border)"}`,
              color: tab === t.key ? "#C9A84C" : "var(--text-secondary)", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── 조직도 ── */}
        {tab === "structure" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* 핵심 규칙 3가지 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ background: "rgba(107,114,128,0.08)", border: "1.5px solid rgba(107,114,128,0.35)", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, color: "#6B7280", margin: "0 0 4px" }}>👤 멤버 소개</p>
                <p style={{ fontSize: "18px", fontWeight: 900, color: "#6B7280", margin: "0 0 2px" }}>5%</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>어떤 창업자든<br/>소개 시 창업비 × 5%</p>
              </div>
              <div style={{ background: "rgba(79,163,232,0.08)", border: "1.5px solid rgba(79,163,232,0.35)", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, color: "#4FA3E8", margin: "0 0 4px" }}>💼 판권</p>
                <p style={{ fontSize: "18px", fontWeight: 900, color: "#4FA3E8", margin: "0 0 2px" }}>25%/32%</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>1회 소개수수료<br/>매니저 25% · 디렉터 32%</p>
              </div>
              <div style={{ background: "rgba(239,159,39,0.08)", border: "1.5px solid rgba(239,159,39,0.35)", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, color: "#EF9F27", margin: "0 0 4px" }}>🔄 관리비용</p>
                <p style={{ fontSize: "18px", fontWeight: 900, color: "#EF9F27", margin: "0 0 2px" }}>10%</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>팀원 판권 수익의<br/>10% 지속 수령</p>
              </div>
            </div>

            {/* 조직도 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "24px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <Person emoji="👑" label="나 (디렉터)" badge="DIRECTOR" color="#E8599A" me sub="판권 32%" />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 2, height: 10, background: "rgba(232,89,154,0.4)" }} />
                  <div style={{ padding: "2px 10px", borderRadius: "999px", background: "rgba(232,89,154,0.12)", border: "1px solid rgba(232,89,154,0.3)", fontSize: "10px", fontWeight: 700, color: "#E8599A" }}>↓ 직추천 1대만 수당</div>
                  <div style={{ width: 2, height: 10, background: "rgba(232,89,154,0.2)" }} />
                </div>

                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["매니저 A", "매니저 B"].map((name) => (
                    <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      {/* 판권 + 관리비용 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
                        <div style={{ padding: "2px 8px", borderRadius: "6px", background: "rgba(79,163,232,0.12)", border: "1px solid rgba(79,163,232,0.3)", fontSize: "9px", fontWeight: 700, color: "#4FA3E8" }}>
                          판권 ↑ 창업비×32%
                        </div>
                        <div style={{ padding: "2px 8px", borderRadius: "6px", background: "rgba(239,159,39,0.12)", border: "1px solid rgba(239,159,39,0.3)", fontSize: "9px", fontWeight: 700, color: "#EF9F27" }}>
                          관리비용 ↑ A판권×10%
                        </div>
                      </div>
                      <Person emoji="👔" label={name} badge="MANAGER" color="#378ADD" sub="판권 25%" />

                      <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>↓ 나는 수당 없음</div>
                      <div style={{ display: "flex", gap: "8px", opacity: 0.45 }}>
                        <Person emoji="👤" label="멤버" badge="MEMBER" color="#6B7280" small />
                        <Person emoji="👤" label="멤버" badge="MEMBER" color="#6B7280" small />
                      </div>
                      <div style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.06)", border: "1px dashed rgba(239,68,68,0.25)", fontSize: "9px", color: "rgba(239,68,68,0.7)", fontWeight: 600 }}>
                        ✗ 나는 수당 없음
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* O/X */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#10B981", marginBottom: "8px" }}>✅ 수당 발생</p>
                {["내가 소개 → 판권 (1회)", "팀원이 판권 받을 때 → 관리비용 10%", "90일 미션 달성 → 패스트스타트", "팀원 첫모집 성공 → 보너스"].map(t => (
                  <p key={t} style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "0 0 3px" }}>• {t}</p>
                ))}
              </div>
              <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#F87171", marginBottom: "8px" }}>❌ 수당 없음</p>
                {["팀원의 팀원 창업비", "2단계 이하 조직 수익", "자발적 가입"].map(t => (
                  <p key={t} style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 3px" }}>• {t}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 수당 구조 ── */}
        {tab === "commissions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* 매니저 vs 디렉터 비교 — 모바일 가로 고정 */}
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { rank: "매니저", color: "#378ADD", icon: "👔", fee: "300만",
                  items: [{ k: "판권", v: "25%=75만", c: "#4FA3E8" }, { k: "관리비용", v: "×10%", c: "#EF9F27" }, { k: "패스트", v: "+3%=9만", c: "#10B981" }, { k: "첫모집", v: "+2%/건", c: "#F472B6" }],
                  total: "40%" },
                { rank: "디렉터", color: "#E8599A", icon: "👑", fee: "500만",
                  items: [{ k: "판권", v: "32%=160만", c: "#4FA3E8" }, { k: "관리비용", v: "×10%", c: "#EF9F27" }, { k: "패스트", v: "+5%=25만", c: "#10B981" }, { k: "첫모집", v: "+3%/건", c: "#F472B6" }],
                  total: "50%" },
              ].map(r => (
                <div key={r.rank} style={{ flex: 1, background: `${r.color}08`, border: `1.5px solid ${r.color}30`, borderRadius: "14px", padding: "12px", minWidth: 0 }}>
                  {/* 헤더 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "20px", flexShrink: 0 }}>{r.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: r.color, margin: 0, whiteSpace: "nowrap" }}>{r.rank}</p>
                        <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0 }}>창업비 {r.fee}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: r.color, flexShrink: 0 }}>{r.total}</span>
                  </div>
                  {/* 수당 항목 */}
                  {r.items.map(i => (
                    <div key={i.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", borderRadius: "6px", background: "var(--bg)", marginBottom: "3px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>{i.k}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: i.c, textAlign: "right" }}>{i.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 수당 카드 */}
            {COMMISSIONS.map(c => (
              <div key={c.no} style={{ background: `${c.color}07`, border: `1px solid ${c.color}25`, borderRadius: "14px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{c.icon}</span>
                    <div>
                      <span style={{ fontSize: "10px", color: c.color, fontWeight: 700, opacity: 0.7 }}>{c.no} </span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                    </div>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: "999px", background: `${c.color}18`, border: `1px solid ${c.color}40`, fontSize: "12px", fontWeight: 900, color: c.color }}>{c.rate}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "0 0 6px", lineHeight: 1.5 }}>{c.desc}</p>
                <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "7px 10px" }}>
                  <span style={{ fontSize: "10px", color: c.color, fontWeight: 700 }}>예시 </span>
                  {c.ex.split("\n").map((line, i) => (
                    <span key={i} style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{line}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* 공동 풀 */}
            <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: "14px", padding: "14px" }}>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#A78BFA", marginBottom: "8px" }}>⚡ 공동 풀 — 월 전체 창업비의 4%</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "14px" }}>👔</span>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#378ADD", margin: "4px 0 0" }}>매니저 풀 2%</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>매니저 전원 균등</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "14px" }}>👑</span>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#E8599A", margin: "4px 0 0" }}>디렉터 풀 2%</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>디렉터 전원 균등</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 수입 예시 ── */}
        {tab === "scenarios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* 직급별 영업 수익표 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)", background: "rgba(201,168,76,0.07)" }}>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#C9A84C", margin: 0 }}>💼 내 직급별 판권 수익 (1회)</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "3px 0 0" }}>누구를 소개하든 내 직급 기준으로 창업비 × 판권율</p>
              </div>
              {[
                {
                  who: "매니저", whoColor: "#378ADD", whoIcon: "👔", rate: "25%",
                  rows: [
                    { target: "멤버 소개",    fee: "5만원",   earn: "12,500원" },
                    { target: "매니저 소개",  fee: "300만원", earn: "75만원" },
                    { target: "디렉터 소개",  fee: "500만원", earn: "125만원" },
                  ]
                },
                {
                  who: "디렉터", whoColor: "#E8599A", whoIcon: "👑", rate: "32%",
                  rows: [
                    { target: "멤버 소개",    fee: "5만원",   earn: "16,000원" },
                    { target: "매니저 소개",  fee: "300만원", earn: "96만원" },
                    { target: "디렉터 소개",  fee: "500만원", earn: "160만원" },
                  ]
                },
                {
                  who: "멤버", whoColor: "#6B7280", whoIcon: "👤", rate: "5%",
                  rows: [
                    { target: "멤버 소개",    fee: "5만원",   earn: "2,500원" },
                    { target: "매니저 소개",  fee: "300만원", earn: "15만원" },
                    { target: "디렉터 소개",  fee: "500만원", earn: "25만원" },
                  ]
                },
              ].map((g, gi) => (
                <div key={g.who}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: `${g.whoColor}06`, borderBottom: "1px solid var(--bg-border)" }}>
                    <span style={{ fontSize: "16px" }}>{g.whoIcon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: g.whoColor }}>{g.who} 가 영업 시</span>
                    <span style={{ padding: "1px 8px", borderRadius: "999px", background: `${g.whoColor}18`, border: `1px solid ${g.whoColor}35`, fontSize: "11px", fontWeight: 700, color: g.whoColor }}>판권 {g.rate}</span>
                  </div>
                  {g.rows.map((r, ri) => (
                    <div key={r.target} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: ri < g.rows.length - 1 || gi < 2 ? "1px solid var(--bg-border)" : "none" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{r.target}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "6px" }}>창업비 {r.fee}</span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: g.whoColor }}>{r.earn}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {SCENARIOS.map((s, i) => (
              <div key={i} style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}30`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: s.color, margin: 0 }}>{s.title}</p>
                  <span style={{ padding: "2px 8px", borderRadius: "999px", background: `${s.color}15`, fontSize: "10px", fontWeight: 700, color: s.color }}>
                    {s.rank} · {s.basis}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "9px", background: "var(--bg)" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{item.note}</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: s.color }}>{item.amount.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", background: `${s.color}15`, border: `1.5px solid ${s.color}40` }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>예상 수당 합계</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>실수령 약 {Math.floor(s.total * 0.967).toLocaleString()}원 (세후)</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontSize: "28px", fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.total.toLocaleString()}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>원</p>
                  </div>
                </div>
                {(s as any).tip && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)" }}>
                    <span style={{ fontSize: "14px" }}>💡</span>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#C9A84C", margin: 0 }}>{(s as any).tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 승급 조건 ── */}
        {tab === "promotion" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* 멤버 → 매니저 → 디렉터 로드맵 */}
            {[
              { from: { e: "👤", l: "멤버", b: "MEMBER", c: "#6B7280", f: "5만원+" },
                to:   { e: "👔", l: "매니저", b: "MANAGER", c: "#378ADD", f: "소매창업 330만원" },
                cond: "소개 누적 창업비 합계 1,000만원", tip: "창업자 3~4명 소개하면 달성" },
              { from: { e: "👔", l: "매니저", b: "MANAGER", c: "#378ADD", f: "소매창업 330만원" },
                to:   { e: "👑", l: "디렉터", b: "DIRECTOR", c: "#E8599A", f: "도매창업 550만원" },
                cond: "직추천 매니저 3명 + 산하 전체 누적 2,000만원", tip: "또는 도매 창업(550만원)으로 즉시 디렉터" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <Person emoji={s.from.e} label={s.from.l} badge={s.from.b} color={s.from.c} sub={s.from.f} />
                  <div style={{ flex: 1, minWidth: "120px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", marginBottom: "6px" }}>→</div>
                    <div style={{ padding: "6px 10px", borderRadius: "10px", background: `${s.to.c}12`, border: `1px solid ${s.to.c}30` }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: s.to.c, margin: 0 }}>{s.cond}</p>
                    </div>
                  </div>
                  <Person emoji={s.to.e} label={s.to.l} badge={s.to.b} color={s.to.c} sub={s.to.f} />
                </div>
                <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <span style={{ fontSize: "10px", color: "#C9A84C", fontWeight: 700 }}>💡 </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.tip}</span>
                </div>
              </div>
            ))}

            {/* 본부장 타이틀 */}
            <div style={{ background: "rgba(255,215,0,0.07)", border: "2px solid rgba(255,215,0,0.4)", borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #FFD700, #FFA500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>🏅</div>
                <div>
                  <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.5)", fontSize: "10px", fontWeight: 800, color: "#FFD700", marginBottom: "4px" }}>SPECIAL TITLE</div>
                  <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 900, color: "#FFD700", margin: 0 }}>본부장</h3>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>조건: 디렉터가 디렉터를 3명 배출</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>본부장 타이틀이 부여됩니다. 추가 혜택은 추후 공개 예정입니다.</p>
              </div>
            </div>

            {/* 창업 유형 비교 */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bg-border)" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>창업 유형 비교</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <th style={{ padding: "9px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>구분</th>
                    <th style={{ padding: "9px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>👔 매니저</th>
                    <th style={{ padding: "9px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>👑 디렉터</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "창업비",    v1: "330만원",        v2: "550만원" },
                    { label: "판권",      v1: "25%",            v2: "32%" },
                    { label: "소개 시",   v1: "75만원/건",      v2: "160만원/건" },
                    { label: "패스트스타트", v1: "+3%",         v2: "+5%" },
                    { label: "팀원첫모집",  v1: "+2%/건",       v2: "+3%/건" },
                    { label: "구매가격",   v1: "소매가",        v2: "도매가" },
                  ].map(({ label, v1, v2 }) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                      <td style={{ padding: "8px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{label}</td>
                      <td style={{ padding: "8px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>{v1}</td>
                      <td style={{ padding: "8px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>{v2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
