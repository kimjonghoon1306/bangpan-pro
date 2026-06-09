"use client";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const C = {
  member:   { main: "#6B7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.30)", label: "MEMBER" },
  manager:  { main: "#378ADD", bg: "rgba(55,138,221,0.10)",  border: "rgba(55,138,221,0.30)",  label: "MANAGER" },
  director: { main: "#E8599A", bg: "rgba(232,89,154,0.10)", border: "rgba(232,89,154,0.30)",  label: "DIRECTOR" },
};

function PersonCard({
  rank, name, fee, sub, highlight, small
}: {
  rank: keyof typeof C; name: string; fee?: string; sub?: string; highlight?: boolean; small?: boolean;
}) {
  const s = C[rank];
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
    }}>
      {/* 아이콘 */}
      <div style={{
        width: small ? 48 : 64, height: small ? 48 : 64, borderRadius: "50%",
        background: s.main,
        border: highlight ? `3px solid #FFD700` : `2px solid ${s.main}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: small ? "24px" : "32px",
        boxShadow: highlight ? `0 0 20px rgba(255,215,0,0.5)` : `0 4px 16px ${s.bg}`,
        position: "relative",
        flexShrink: 0,
      }}>
        {rank === "director" ? "👑" : rank === "manager" ? "👔" : "👤"}
        {highlight && (
          <div style={{
            position: "absolute", top: -8, right: -8,
            background: "#FFD700", color: "#000", fontSize: "8px", fontWeight: 900,
            padding: "2px 5px", borderRadius: "999px", whiteSpace: "nowrap",
          }}>나</div>
        )}
      </div>
      {/* 이름 */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "2px 8px", borderRadius: "999px",
          background: s.bg, border: `1px solid ${s.border}`,
          fontSize: small ? "10px" : "11px", fontWeight: 800, color: s.main, marginBottom: "2px",
        }}>{s.label}</div>
        <p style={{ fontSize: small ? "12px" : "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{name}</p>
        {fee && <p style={{ fontSize: "11px", color: s.main, margin: 0, fontWeight: 700 }}>{fee}</p>}
        {sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

function MoneyBadge({ amount, color, label }: { amount: string; color: string; label?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
    }}>
      {label && <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>}
      <div style={{
        padding: "4px 10px", borderRadius: "999px",
        background: `${color}22`, border: `1px solid ${color}66`,
        fontSize: "12px", fontWeight: 800, color,
      }}>💰 {amount}</div>
    </div>
  );
}

const SCENARIOS = [
  {
    title: "🌱 입문 — 본인 창업 후 창업자 모집 시 수입",
    color: "#378ADD",
    basis: "본인 창업(330만원) = 사업 시작 · 수입은 모집부터 발생",
    items: [
      { label: "매니저 1명 모집 → 판권 25%",    amount: 750000, note: "300만 × 25% · 모집 시마다 1회 발생" },
      { label: "관리비용 (팀원 판권×10%)",       amount:  75000, note: "팀원이 또 모집할 때마다 지속 발생" },
      { label: "패스트 스타트 3%",               amount:  90000, note: "가입 90일 내 목표 달성 시" },
    ],
    total: 915000,
  },
  {
    title: "📈 성장 — 매니저 3명 소개",
    color: "#378ADD",
    basis: "매니저 창업 (300만원)",
    items: [
      { label: "판권 25% × 3명",            amount: 2250000, note: "300만 × 25% × 3" },
      { label: "관리비용 (팀원 판권×10%)",  amount:  225000, note: "75만 × 10% × 3명" },
      { label: "팀원 첫모집 2% × 3건",      amount:  180000, note: "300만 × 2% × 3" },
      { label: "패스트 스타트 3%",          amount:   90000, note: "조건 달성 시" },
    ],
    total: 2745000,
  },
  {
    title: "💎 디렉터 — 팀 완성",
    color: "#E8599A",
    basis: "디렉터 창업 (500만원)",
    items: [
      { label: "판권 32% × 5명",            amount: 4000000, note: "500만 × 32% × 5" },
      { label: "관리비용 (팀원 판권×10%)",  amount:  400000, note: "160만 × 10% × 5명" },
      { label: "팀원 첫모집 3% × 5건",      amount:  250000, note: "500만 × 3% × 5" },
      { label: "디렉터 풀 배분",             amount:  500000, note: "전체 매출 2% ÷ N명" },
    ],
    total: 5150000,
  },
];

const COMMISSIONS = [
  {
    no: "①", name: "판권 (소개수수료)", rate: "25%/32%", color: "#4FA3E8",
    desc: "내가 누군가를 소개할 때 받는 1회성 수수료. 내 직급에 따라 비율이 다릅니다.",
    example: "매니저가 소개 시 → 창업비 × 25% | 디렉터가 소개 시 → 창업비 × 32%",
    icon: "💼",
  },
  {
    no: "②", name: "관리비용 (오버라이드)", rate: "10%", color: "#EF9F27",
    desc: "내 직추천 팀원이 판권을 받을 때마다 그 수익의 10%를 관리비용으로 지속 수령합니다.",
    example: "팀원이 75만원 판권 수령 → 나: 7.5만원 | 팀원이 160만원 판권 → 나: 16만원",
    icon: "🔄",
  },
  {
    no: "③", name: "멤버 소개 수당", rate: "5%", color: "#6B7280",
    desc: "멤버가 창업자를 소개할 때만 적용되는 소개 수당입니다.",
    example: "매니저 소개 → 300만 × 5% = 15만원 | 디렉터 소개 → 500만 × 5% = 25만원",
    icon: "👋",
  },
  {
    no: "④", name: "패스트 스타트", rate: "+3%/+5%", color: "#10B981",
    desc: "가입 후 90일 내 목표 달성 시 추가 지급. 매니저와 디렉터 비율이 다릅니다.",
    example: "매니저: 창업비 × 3% = 9만원 | 디렉터: 창업비 × 5% = 25만원",
    icon: "🚀",
  },
  {
    no: "⑤", name: "팀원 첫모집 보너스", rate: "+2%/+3%", color: "#F472B6",
    desc: "내 직추천 팀원이 처음으로 새 창업자를 모집했을 때 받는 보너스입니다.",
    example: "매니저: 창업비 × 2% = 6만원/건 | 디렉터: 창업비 × 3% = 9~15만원/건",
    icon: "🎯",
  },
  {
    no: "⑥", name: "매니저 풀", rate: "2%", color: "#378ADD",
    desc: "월 전체 창업비 매출의 2%를 매니저 전원이 N분의1로 균등 배분합니다.",
    example: "월 총 창업비 5,000만원 → 100만원 ÷ 매니저 수",
    icon: "👔",
  },
  {
    no: "⑦", name: "디렉터 풀", rate: "2%", color: "#E8599A",
    desc: "월 전체 창업비 매출의 2%를 디렉터 전원이 N분의1로 균등 배분합니다.",
    example: "월 총 창업비 5,000만원 → 100만원 ÷ 디렉터 수",
    icon: "👑",
  },
  {
    no: "⑧", name: "회사 재량 지급", rate: "1%", color: "#A78BFA",
    desc: "월 전체 창업비의 1%를 회사가 성과·포상·이벤트 등으로 임의 지급합니다.",
    example: "월 총 창업비 5,000만원 → 50만원 (관리자 지정 지급)",
    icon: "🎯",
  },
];

export default function CommissionGuidePage() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeTab, setActiveTab] = useState<"chart"|"commissions"|"scenarios"|"promotion">("chart");

  const TABS = [
    { key: "chart",       label: "📊 조직도",    },
    { key: "commissions", label: "💰 수당 7가지", },
    { key: "scenarios",   label: "📈 시나리오",   },
    { key: "promotion",   label: "🏆 승급 조건",  },
  ] as const;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease both; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .arrow-down { animation: pulse 1.5s infinite; }
      `}</style>

      {/* 헤더 */}
      <div style={{ textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", marginBottom: "10px" }}>
          COMMISSION STRUCTURE
        </span>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 6px" }}>
          수당 플랜 설명서
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
          농축수산물 방판 · 판권 + 관리비용 구조 · 총 수당 재원 55%
        </p>
      </div>
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <ThemeToggle size="sm" />
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 20px", borderRadius: "12px", cursor: "pointer",
            fontSize: "13px", fontWeight: 700, transition: "all 0.2s",
            background: activeTab === t.key ? "rgba(201,168,76,0.2)" : "var(--bg-elevated)",
            border: `1.5px solid ${activeTab === t.key ? "rgba(201,168,76,0.6)" : "var(--bg-border)"}`,
            color: activeTab === t.key ? "#C9A84C" : "var(--text-secondary)",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: 조직도 ── */}
      {activeTab === "chart" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* 핵심 룰 뱃지 */}
          <div style={{
            background: "rgba(255,215,0,0.08)", border: "2px solid rgba(255,215,0,0.35)",
            borderRadius: "16px", padding: "16px 24px",
            display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "28px" }}>⚡</span>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "#FFD700", margin: 0 }}>
                핵심 규칙 — 수당은 직추천 1대에서만 발생
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                내가 직접 추천한 사람의 창업비에서만 수당을 받습니다. 그 이하는 각자가 받습니다.
              </p>
            </div>
          </div>

          {/* 조직도 */}
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
            borderRadius: "24px", padding: "40px 24px", overflow: "auto",
          }}>
            {/* 상단: 나 (디렉터) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
              <PersonCard rank="director" name="나 (디렉터)" fee="도매창업 550만원" highlight />

              {/* 세로선 + 수당 레이블 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", margin: "4px 0" }}>
                <div style={{ width: "2px", height: "16px", background: "linear-gradient(to bottom, #E8599A, rgba(232,89,154,0.3))" }} />
                <div style={{ padding: "3px 12px", borderRadius: "999px", background: "rgba(232,89,154,0.15)", border: "1px solid rgba(232,89,154,0.4)", fontSize: "11px", fontWeight: 800, color: "#E8599A" }}>
                  ↓ 직추천에서만 수당 발생
                </div>
                <div style={{ width: "2px", height: "16px", background: "linear-gradient(to bottom, rgba(232,89,154,0.3), transparent)" }} />
              </div>

              {/* 1대 직추천 가로 레이아웃 */}
              <div style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>

                {/* 매니저 A */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(55,138,221,0.15)", border: "1px solid rgba(55,138,221,0.3)", fontSize: "11px", fontWeight: 700, color: "#378ADD" }}>
                    수당 30만원 ↑
                  </div>
                  <PersonCard rank="manager" name="매니저 A" fee="소매창업 330만원" />

                  {/* 매니저A의 팀원들 (나는 수당 없음) */}
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                    ↓ 나는 수당 없음
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.5 }}>
                      <PersonCard rank="member" name="멤버 C" fee="5만원+" small />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.5 }}>
                      <PersonCard rank="member" name="멤버 D" fee="5만원+" small />
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(255,0,0,0.08)", border: "1px dashed rgba(255,0,0,0.3)", fontSize: "10px", color: "rgba(255,100,100,0.8)", fontWeight: 700 }}>
                    ✗ 나(디렉터)는 수당 없음
                  </div>
                </div>

                {/* 매니저 B */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(55,138,221,0.15)", border: "1px solid rgba(55,138,221,0.3)", fontSize: "11px", fontWeight: 700, color: "#378ADD" }}>
                    수당 30만원 ↑
                  </div>
                  <PersonCard rank="manager" name="매니저 B" fee="소매창업 330만원" />
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>↓ 나는 수당 없음</div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ opacity: 0.5 }}>
                      <PersonCard rank="member" name="멤버 E" fee="5만원+" small />
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(255,0,0,0.08)", border: "1px dashed rgba(255,0,0,0.3)", fontSize: "10px", color: "rgba(255,100,100,0.8)", fontWeight: 700 }}>
                    ✗ 나(디렉터)는 수당 없음
                  </div>
                </div>

                {/* 멤버 F (직추천 멤버) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(107,114,128,0.15)", border: "1px solid rgba(107,114,128,0.3)", fontSize: "11px", fontWeight: 700, color: "#9CA3AF" }}>
                    소개수당 2.5만원 ↑
                  </div>
                  <PersonCard rank="member" name="멤버 F" fee="5만원+" />
                  <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(107,114,128,0.08)", border: "1px dashed rgba(107,114,128,0.3)", fontSize: "10px", color: "rgba(160,160,160,0.8)", fontWeight: 700, textAlign: "center" }}>
                    멤버는 창업자<br/>소개 수당 5%만
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* 수당 흐름 요약 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div style={{ background: "rgba(55,138,221,0.07)", border: "1px solid rgba(55,138,221,0.25)", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#378ADD", margin: 0 }}>수당 받는 경우</p>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {["내가 직접 창업 → 직판 수당 32%", "내가 직추천한 사람 창업 → 오버라이드 10%", "가입 90일 내 미션 달성 → 패스트스타트 5%", "내 팀원의 첫 모집 성공 → 3% 보너스", "매니저/디렉터 풀 월 배분"].map(t => (
                  <li key={t} style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: "rgba(255,60,60,0.05)", border: "1px solid rgba(255,60,60,0.2)", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>❌</span>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#F87171", margin: 0 }}>수당 없는 경우</p>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {["내 팀원이 추천한 사람의 창업비", "2단계 이하 조직 창업비", "상대방이 스스로 가입한 경우", "기존 회원 이동/재등록"].map(t => (
                  <li key={t} style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: 수당 7가지 ── */}
      {activeTab === "commissions" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 총 재원 배분 바 — 매니저/디렉터 구분 */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "14px", letterSpacing: "0.08em" }}>창업비 배분 구조</p>
            {[
              { rank: "매니저 (300만원 기준)", bars: [{ l: "판권25%", w: 25, c: "#4FA3E8" }, { l: "패스트3%", w: 3, c: "#10B981" }, { l: "팀원2%", w: 2, c: "#F472B6" }, { l: "풀5%", w: 5, c: "#A78BFA" }, { l: "회사1%", w: 1, c: "#8B5CF6" }, { l: "회사64%", w: 64, c: "var(--bg-border)" }], total: "36%", color: "#378ADD" },
              { rank: "디렉터 (500만원 기준)", bars: [{ l: "판권32%", w: 32, c: "#4FA3E8" }, { l: "패스트5%", w: 5, c: "#10B981" }, { l: "팀원3%", w: 3, c: "#F472B6" }, { l: "풀5%", w: 5, c: "#A78BFA" }, { l: "회사1%", w: 1, c: "#8B5CF6" }, { l: "회사54%", w: 54, c: "var(--bg-border)" }], total: "46%", color: "#E8599A" },
            ].map(({ rank, bars, total, color }) => (
              <div key={rank} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color }}>{rank}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#C9A84C" }}>수당 {total}</span>
                </div>
                <div style={{ display: "flex", height: "24px", borderRadius: "6px", overflow: "hidden", gap: "1px" }}>
                  {bars.map(({ l, w, c }) => (
                    <div key={l} style={{ width: `${w}%`, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 800, color: c === "var(--bg-border)" ? "var(--text-muted)" : "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {w >= 3 ? l : ""}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "8px 0 0" }}>※ 관리비용(팀원 판권의 10%)은 별도 산정됩니다</p>
          </div>

          {/* 수당 카드 7가지 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
            {COMMISSIONS.map((c) => (
              <div key={c.no} style={{
                background: `${c.color}08`, border: `1px solid ${c.color}30`,
                borderRadius: "18px", padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "28px" }}>{c.icon}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: c.color, opacity: 0.7 }}>{c.no}</span>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{c.name}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 12px", borderRadius: "999px",
                    background: `${c.color}20`, border: `1px solid ${c.color}50`,
                    fontSize: "16px", fontWeight: 900, color: c.color, flexShrink: 0,
                  }}>
                    {c.rate}
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>{c.desc}</p>
                <div style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px 12px" }}>
                  <span style={{ fontSize: "10px", color: c.color, fontWeight: 700 }}>예시 </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.example}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 수당표 (창업비별) */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bg-border)" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>창업비별 수당 금액표</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>수당 항목</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#6B7280" }}>멤버<br/><span style={{ fontSize: "10px", fontWeight: 600 }}>5만원+</span></th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#378ADD" }}>매니저<br/><span style={{ fontSize: "10px", fontWeight: 600 }}>330만원</span></th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#E8599A" }}>디렉터<br/><span style={{ fontSize: "10px", fontWeight: 600 }}>550만원</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "직판 수당 (32%)", member: "—", manager: "96만원", director: "160만원", color: "#4FA3E8" },
                    { label: "추천 오버라이드",  member: "5% = 15만/25만", manager: "10% = 30만/50만", director: "10% = 30만/50만", color: "#EF9F27" },
                    { label: "패스트 스타트",    member: "—", manager: "+15만원", director: "+25만원", color: "#10B981" },
                    { label: "팀원 첫모집",      member: "—", manager: "+9만원/명", director: "+15만원/명", color: "#F472B6" },
                    { label: "매니저 풀 (2%)",   member: "—", manager: "균등배분", director: "—", color: "#EF9F27" },
                    { label: "디렉터 풀 (2%)",   member: "—", manager: "—", director: "균등배분", color: "#E8599A" },
                  ].map(({ label, member, manager, director, color }) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "2px", background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
                        </div>
                      </td>
                      {[member, manager, director].map((v, i) => (
                        <td key={i} style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: v === "—" ? 400 : 700, color: v === "—" ? "rgba(255,255,255,0.2)" : color }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: 시나리오 ── */}
      {activeTab === "scenarios" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 시나리오 선택 */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {SCENARIOS.map((s, i) => (
              <button key={i} onClick={() => setActiveScenario(i)} style={{
                padding: "12px 20px", borderRadius: "14px", cursor: "pointer",
                fontSize: "13px", fontWeight: 700, transition: "all 0.2s",
                background: activeScenario === i ? `${s.color}20` : "var(--bg-elevated)",
                border: `2px solid ${activeScenario === i ? s.color : "var(--bg-border)"}`,
                color: activeScenario === i ? s.color : "var(--text-muted)",
              }}>
                {s.title}
              </button>
            ))}
          </div>

          {/* 시나리오 상세 */}
          {SCENARIOS.map((s, i) => activeScenario !== i ? null : (
            <div key={i} className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* 조직도 미니 */}
              <div style={{
                background: `${s.color}08`, border: `1.5px solid ${s.color}30`,
                borderRadius: "20px", padding: "28px",
              }}>
                <p style={{ fontSize: "12px", color: s.color, fontWeight: 700, marginBottom: "20px", letterSpacing: "0.08em" }}>조직 구조</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>

                  {/* 나 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", border: "3px solid #FFD700", position: "relative" }}>
                      {i === 0 ? "👔" : i === 1 ? "👔" : "👑"}
                      <div style={{ position: "absolute", top: -8, right: -8, background: "#FFD700", color: "#000", fontSize: "8px", fontWeight: 900, padding: "2px 5px", borderRadius: "999px" }}>나</div>
                    </div>
                    <div style={{ padding: "2px 10px", borderRadius: "999px", background: `${s.color}20`, fontSize: "11px", fontWeight: 800, color: s.color }}>
                      {i === 2 ? "디렉터" : "매니저"}
                    </div>
                  </div>

                  {/* 직추천 */}
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    {(i === 0 ? ["매니저 A"] : i === 1 ? ["매니저 A", "매니저 B", "매니저 C"] : ["매니저 A", "매니저 B", "매니저 C", "매니저 D", "매니저 E"]).map((name) => (
                      <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <div style={{ fontSize: "10px", color: "#378ADD", fontWeight: 700 }}>
                          {i === 2 ? "↑ 50만원" : "↑ 30만원"}
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#378ADD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👔</div>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 수당 계산 */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "18px", padding: "24px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.08em" }}>수당 계산 ({s.basis})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{item.label}</span>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{item.note}</p>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: s.color }}>
                        {item.amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
                {/* 합계 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderRadius: "14px", background: `${s.color}15`, border: `2px solid ${s.color}40` }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>예상 월 수당 합계</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>세금 3.3% 공제 전</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontSize: "36px", fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>
                      {s.total.toLocaleString()}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>원</p>
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px", textAlign: "right" }}>
                  실수령 약 {Math.floor(s.total * 0.967).toLocaleString()}원 (세후)
                </p>
                {activeScenario === 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "12px", padding: "14px 16px", borderRadius: "12px", background: "rgba(255,215,0,0.07)", border: "1.5px solid rgba(255,215,0,0.35)" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>💡</span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: "#C9A84C", margin: "0 0 4px" }}>
                        본인 창업은 사업의 시작입니다
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                        창업비를 납부하고 매니저/디렉터 자격을 얻는 것이며, 수입은 창업자를 모집할 때부터 발생합니다. 모집을 지속할수록 관리비용이 매달 쌓입니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: 승급 조건 ── */}
      {activeTab === "promotion" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* 로드맵 */}
          <div style={{ display: "flex", alignItems: "stretch", gap: "0", flexWrap: "wrap", justifyContent: "center" }}>

            {/* 멤버 */}
            <div style={{ flex: "1 1 220px", background: "rgba(107,114,128,0.08)", border: "1.5px solid rgba(107,114,128,0.3)", borderRadius: "20px 0 0 20px", padding: "24px", minWidth: "200px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>👤</div>
                <div>
                  <div style={{ padding: "3px 12px", borderRadius: "999px", background: "rgba(107,114,128,0.2)", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", display: "inline-block" }}>MEMBER</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#9CA3AF", margin: 0 }}>멤버</h3>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "14px", width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px" }}>가입 조건</p>
                  <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: 0 }}>5만원 이상 구매</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "14px", width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px" }}>수당</p>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 700, margin: 0 }}>창업자 소개 5%</p>
                </div>
              </div>
            </div>

            {/* 화살표 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px", minWidth: "80px" }}>
              <div style={{ background: "rgba(55,138,221,0.15)", border: "1px solid rgba(55,138,221,0.3)", borderRadius: "12px", padding: "8px 12px", textAlign: "center" }}>
                <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 600 }}>승급 조건</p>
                <p style={{ fontSize: "11px", color: "#378ADD", fontWeight: 800, margin: 0 }}>소개 누적<br/>창업비 합계</p>
                <p style={{ fontSize: "14px", color: "#378ADD", fontWeight: 900, margin: "4px 0 0" }}>1,000만원</p>
              </div>
              <div style={{ fontSize: "24px", marginTop: "8px" }}>→</div>
            </div>

            {/* 매니저 */}
            <div style={{ flex: "1 1 220px", background: "rgba(55,138,221,0.08)", border: "1.5px solid rgba(55,138,221,0.3)", padding: "24px", minWidth: "200px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#378ADD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>👔</div>
                <div>
                  <div style={{ padding: "3px 12px", borderRadius: "999px", background: "rgba(55,138,221,0.2)", fontSize: "10px", fontWeight: 800, color: "#378ADD", marginBottom: "6px", display: "inline-block" }}>MANAGER</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#378ADD", margin: 0 }}>매니저</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>소매창업 330만원</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "14px", width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px" }}>창업비 수당 (300만원 기준)</p>
                  {[
                    { label: "직판 수당", val: "96만원" },
                    { label: "추천 오버라이드", val: "30만원/명" },
                    { label: "패스트 스타트", val: "+15만원" },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 화살표 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px", minWidth: "80px" }}>
              <div style={{ background: "rgba(232,89,154,0.15)", border: "1px solid rgba(232,89,154,0.3)", borderRadius: "12px", padding: "8px 12px", textAlign: "center" }}>
                <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 600 }}>승급 조건</p>
                <p style={{ fontSize: "11px", color: "#E8599A", fontWeight: 800, margin: 0 }}>직추천 매니저</p>
                <p style={{ fontSize: "14px", color: "#E8599A", fontWeight: 900, margin: "4px 0 0" }}>3명 이상</p>
                <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: "4px 0 0" }}>+산하 누적 2,000만원</p>
              </div>
              <div style={{ fontSize: "24px", marginTop: "8px" }}>→</div>
            </div>

            {/* 디렉터 */}
            <div style={{ flex: "1 1 220px", background: "rgba(232,89,154,0.08)", border: "1.5px solid rgba(232,89,154,0.3)", borderRadius: "0 20px 20px 0", padding: "24px", minWidth: "200px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8599A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 0 24px rgba(232,89,154,0.4)" }}>👑</div>
                <div>
                  <div style={{ padding: "3px 12px", borderRadius: "999px", background: "rgba(232,89,154,0.2)", fontSize: "10px", fontWeight: 800, color: "#E8599A", marginBottom: "6px", display: "inline-block" }}>DIRECTOR</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#E8599A", margin: 0 }}>디렉터</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>도매창업 550만원</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "14px", width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px" }}>창업비 수당 (500만원 기준)</p>
                  {[
                    { label: "직판 수당", val: "160만원" },
                    { label: "추천 오버라이드", val: "50만원/명" },
                    { label: "디렉터 풀", val: "균등배분" },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 본부장 타이틀 */}
          <div style={{ background: "rgba(255,215,0,0.07)", border: "2px solid rgba(255,215,0,0.4)", borderRadius: "18px", padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #FFD700, #FFA500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0 }}>🏅</div>
              <div>
                <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.5)", fontSize: "10px", fontWeight: 800, color: "#FFD700", marginBottom: "4px" }}>SPECIAL TITLE</div>
                <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 900, color: "#FFD700", margin: 0 }}>본부장</h3>
              </div>
            </div>
            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>👑</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>조건: 디렉터가 디렉터를 3명 배출</p>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 6px", lineHeight: 1.6 }}>
                디렉터가 직추천으로 디렉터 3명을 배출하면 <strong style={{ color: "#FFD700" }}>본부장</strong> 타이틀이 부여됩니다.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,215,0,0.08)", border: "1px dashed rgba(255,215,0,0.3)" }}>
                <span style={{ fontSize: "14px" }}>🔒</span>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>추가 혜택은 추후 공개 예정입니다.</p>
              </div>
            </div>
          </div>

          {/* 빠른 승급 팁 */}
          <div style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "18px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>💡</span>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#C9A84C", margin: 0 }}>빠른 승급 전략</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {[
                { step: "STEP 1", title: "멤버 → 매니저", desc: "창업자 3~4명 소개하면 누적 창업비 1,000만원 달성 → 자동 승급", color: "#378ADD" },
                { step: "STEP 2", title: "매니저 → 디렉터", desc: "직추천 매니저 3명 + 산하 전체 누적 2,000만원 = 디렉터 승급", color: "#E8599A" },
                { step: "TIP", title: "패스트 스타트 활용", desc: "가입 90일 내 집중 활동으로 +5% 추가 수당. 첫 달이 가장 중요!", color: "#10B981" },
              ].map(({ step, title, desc, color }) => (
                <div key={step} style={{ background: "var(--bg)", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", background: `${color}20`, fontSize: "10px", fontWeight: 800, color, marginBottom: "8px" }}>{step}</div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>{title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
