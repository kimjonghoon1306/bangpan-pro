"use client";
import { useState } from "react";
import { X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const TABS = [
  { key: "structure", label: "📊 조직도" },
  { key: "commissions", label: "💰 수당 7가지" },
  { key: "scenarios", label: "📈 수입 예시" },
  { key: "promotion", label: "🏆 승급 조건" },
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
        boxShadow: me ? "0 0 16px rgba(255,215,0,0.5)" : "none",
        flexShrink: 0,
      }}>
        {emoji}
        {me && <div style={{ position: "absolute", top: -8, right: -8, background: "#FFD700", color: "#000", fontSize: "8px", fontWeight: 900, padding: "2px 5px", borderRadius: "999px" }}>나</div>}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "1px 7px", borderRadius: "999px", fontSize: "9px", fontWeight: 800, background: `${color}22`, color, border: `1px solid ${color}44`, marginBottom: "2px" }}>{badge}</div>
        <p style={{ fontSize: small ? "11px" : "12px", fontWeight: 600, color: "#fff", margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function CommissionGuideModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("structure");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)",
      overflowY: "auto", padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "680px", margin: "0 auto",
        display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "20px",
      }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>1대 오버라이드 · 총 수당 재원 55%</p>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>수당 플랜 설명서</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle size="sm" />
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
              background: tab === t.key ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${tab === t.key ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.1)"}`,
              color: tab === t.key ? "#C9A84C" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── 조직도 ── */}
        {tab === "structure" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700", margin: 0 }}>직추천 1대에서만 수당 발생</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0 }}>내가 직접 추천한 창업자 창업비에서만 수당을 받습니다</p>
              </div>
            </div>

            {/* 조직도 */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "28px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>

                <Person emoji="👑" label="나 (디렉터)" badge="DIRECTOR" color="#E8599A" me sub="도매창업 550만원" />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 2, height: 12, background: "rgba(232,89,154,0.5)" }} />
                  <div style={{ padding: "3px 12px", borderRadius: "999px", background: "rgba(232,89,154,0.15)", border: "1px solid rgba(232,89,154,0.4)", fontSize: "10px", fontWeight: 800, color: "#E8599A" }}>↓ 직추천에서만 수당</div>
                  <div style={{ width: 2, height: 12, background: "rgba(232,89,154,0.3)" }} />
                </div>

                <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["매니저 A", "매니저 B", "매니저 C"].map((name, i) => (
                    <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <div style={{ padding: "3px 10px", borderRadius: "8px", background: "rgba(55,138,221,0.15)", border: "1px solid rgba(55,138,221,0.3)", fontSize: "10px", fontWeight: 700, color: "#378ADD" }}>
                        ↑ 수당 30만원
                      </div>
                      <Person emoji="👔" label={name} badge="MANAGER" color="#378ADD" sub="소매창업 330만원" />
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>↓ 나는 수당 없음</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[0, 1].map(j => (
                          <div key={j} style={{ opacity: 0.4 }}>
                            <Person emoji="👤" label="멤버" badge="MEMBER" color="#6B7280" small />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* O/X 요약 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "rgba(55,138,221,0.06)", border: "1px solid rgba(55,138,221,0.2)", borderRadius: "14px", padding: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#378ADD", marginBottom: "10px" }}>✅ 수당 받는 경우</p>
                {["내가 직접 창업 (직판 32%)", "내 직추천 창업자 (오버 10%)", "90일 미션 달성 (패스트스타트)", "내 팀원 첫모집 성공 (+3%)"].map(t => (
                  <p key={t} style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: "0 0 4px" }}>• {t}</p>
                ))}
              </div>
              <div style={{ background: "rgba(255,60,60,0.05)", border: "1px solid rgba(255,60,60,0.15)", borderRadius: "14px", padding: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#F87171", marginBottom: "10px" }}>❌ 수당 없는 경우</p>
                {["팀원의 팀원 창업비", "2단계 이하 조직 창업비", "상대방 자발적 가입"].map(t => (
                  <p key={t} style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px" }}>• {t}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 수당 7가지 ── */}
        {tab === "commissions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 배분 바 */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", fontWeight: 600 }}>창업비 100% 배분</p>
              <div style={{ display: "flex", height: "24px", borderRadius: "6px", overflow: "hidden", gap: "2px" }}>
                {[
                  { label: "직판 32%", w: 32, color: "#4FA3E8" },
                  { label: "추천 10%", w: 10, color: "#EF9F27" },
                  { label: "패스트 5%", w: 5, color: "#10B981" },
                  { label: "팀원 3%", w: 3, color: "#F472B6" },
                  { label: "풀 5%", w: 5, color: "#A78BFA" },
                  { label: "회사 45%", w: 45, color: "rgba(255,255,255,0.06)" },
                ].map(({ label, w, color }) => (
                  <div key={label} style={{ width: `${w}%`, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 800, color: color.startsWith("rgba") ? "rgba(255,255,255,0.2)" : "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>
                    {w >= 5 ? label : ""}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#C9A84C" }}>수당 합계 55%</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>회사 수익 45%</span>
              </div>
            </div>

            {/* 수당 카드들 */}
            {[
              { no: "①", name: "직판 수당", rate: "32%", color: "#4FA3E8", icon: "💼", desc: "내가 창업할 때 즉시 받는 수당", ex: "매니저 창업 300만원 → 즉시 96만원" },
              { no: "②", name: "추천 오버라이드", rate: "10%", color: "#EF9F27", icon: "🤝", desc: "내가 직추천한 창업자 창업비에서 수령 (1대만)", ex: "매니저 1명 추천 → 30만원 / 디렉터 → 50만원" },
              { no: "③", name: "멤버 소개 수당", rate: "5%", color: "#6B7280", icon: "👋", desc: "멤버가 창업자를 소개할 때 받는 수당", ex: "매니저 소개 → 15만원 / 디렉터 소개 → 25만원" },
              { no: "④", name: "패스트 스타트", rate: "+5%", color: "#10B981", icon: "🚀", desc: "가입 후 90일 내 목표 달성 시 추가 지급", ex: "300만원 창업 + 미션 달성 → 추가 15만원" },
              { no: "⑤", name: "팀원 첫모집 보너스", rate: "+3%", color: "#F472B6", icon: "🎯", desc: "내 팀원이 처음 새 창업자를 모집했을 때", ex: "팀원이 첫 매니저 모집 → 나에게 9만원" },
              { no: "⑥", name: "매니저 풀", rate: "2%", color: "#EF9F27", icon: "👔", desc: "전체 창업비 매출의 2%를 매니저 전원 균등 배분", ex: "월 총 창업비 5,000만원 → 100만원 ÷ 매니저 수" },
              { no: "⑦", name: "디렉터 풀", rate: "2%", color: "#E8599A", icon: "👑", desc: "전체 창업비 매출의 2%를 디렉터 전원 균등 배분", ex: "월 총 창업비 5,000만원 → 100만원 ÷ 디렉터 수" },
            ].map(c => (
              <div key={c.no} style={{ background: `${c.color}08`, border: `1px solid ${c.color}25`, borderRadius: "14px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "22px" }}>{c.icon}</span>
                    <div>
                      <span style={{ fontSize: "10px", color: c.color, fontWeight: 700, opacity: 0.7 }}>{c.no} </span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{c.name}</span>
                    </div>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "999px", background: `${c.color}20`, border: `1px solid ${c.color}44`, fontSize: "14px", fontWeight: 900, color: c.color }}>{c.rate}</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: "0 0 6px", lineHeight: 1.5 }}>{c.desc}</p>
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "7px 10px" }}>
                  <span style={{ fontSize: "10px", color: c.color, fontWeight: 700 }}>예시 </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{c.ex}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 수입 예시 ── */}
        {tab === "scenarios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                title: "🌱 첫 달 — 매니저 창업",
                color: "#378ADD", base: "창업비 300만원 기준",
                items: [
                  { label: "직판 수당 32%", amount: 960000, note: "300만 × 32%" },
                  { label: "패스트 스타트 5%", amount: 150000, note: "90일 미션 달성 시" },
                ],
                total: 1110000,
              },
              {
                title: "📈 3개월 차 — 팀 3명 구성",
                color: "#EF9F27", base: "창업비 300만원 기준",
                items: [
                  { label: "직판 수당 32%", amount: 960000, note: "내 창업비" },
                  { label: "추천 오버라이드 × 3명", amount: 900000, note: "300만 × 10% × 3" },
                  { label: "팀원 첫모집 보너스", amount: 270000, note: "300만 × 3% × 3" },
                  { label: "패스트 스타트", amount: 150000, note: "+5%" },
                ],
                total: 2280000,
              },
              {
                title: "💎 디렉터 — 팀 완성",
                color: "#E8599A", base: "창업비 500만원 기준",
                items: [
                  { label: "직판 수당 32%", amount: 1600000, note: "500만 × 32%" },
                  { label: "추천 오버라이드 × 5명", amount: 1500000, note: "300만 × 10% × 5" },
                  { label: "팀원 첫모집 보너스", amount: 450000, note: "300만 × 3% × 5" },
                  { label: "디렉터 풀 배분", amount: 500000, note: "전체 매출 2% ÷ N명" },
                ],
                total: 4050000,
              },
            ].map((s, i) => (
              <div key={i} style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}30`, borderRadius: "16px", padding: "18px" }}>
                <p style={{ fontSize: "13px", fontWeight: 800, color: s.color, marginBottom: "12px" }}>{s.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "12px" }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "9px", background: "rgba(0,0,0,0.2)" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{item.note}</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: s.color }}>{item.amount.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", background: `${s.color}15`, border: `1.5px solid ${s.color}40` }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>예상 수당 합계</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>실수령 약 {Math.floor(s.total * 0.967).toLocaleString()}원 (세후)</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontSize: "28px", fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.total.toLocaleString()}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>원</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 승급 조건 ── */}
        {tab === "promotion" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                from: { emoji: "👤", label: "멤버", badge: "MEMBER", color: "#6B7280", fee: "5만원+" },
                to:   { emoji: "👔", label: "매니저", badge: "MANAGER", color: "#378ADD", fee: "소매창업 330만원" },
                arrow: "소개 누적 창업비 합계 1,000만원",
                tip: "창업자 3~4명 소개하면 달성",
              },
              {
                from: { emoji: "👔", label: "매니저", badge: "MANAGER", color: "#378ADD", fee: "소매창업 330만원" },
                to:   { emoji: "👑", label: "디렉터", badge: "DIRECTOR", color: "#E8599A", fee: "도매창업 550만원" },
                arrow: "직추천 매니저 3명 + 산하 전체 누적 2,000만원",
                tip: "또는 도매 창업(550만원)으로 즉시 디렉터",
              },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <Person emoji={s.from.emoji} label={s.from.label} badge={s.from.badge} color={s.from.color} sub={s.from.fee} />
                  <div style={{ flex: 1, minWidth: "120px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>→</div>
                    <div style={{ padding: "6px 10px", borderRadius: "10px", background: `${s.to.color}15`, border: `1px solid ${s.to.color}30` }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: s.to.color, margin: 0 }}>{s.arrow}</p>
                    </div>
                  </div>
                  <Person emoji={s.to.emoji} label={s.to.label} badge={s.to.badge} color={s.to.color} sub={s.to.fee} />
                </div>
                <div style={{ marginTop: "12px", padding: "9px 12px", borderRadius: "10px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <span style={{ fontSize: "10px", color: "#C9A84C", fontWeight: 700 }}>💡 TIP </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.tip}</span>
                </div>
              </div>
            ))}

            {/* 창업 유형 비교 */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>창업 유형 비교</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>구분</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>소매창업</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>도매창업</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "창업비", v1: "330만원", v2: "550만원" },
                    { label: "직급", v1: "매니저", v2: "디렉터" },
                    { label: "직판 수당", v1: "96만원", v2: "160만원" },
                    { label: "추천 오버라이드", v1: "30만원/명", v2: "50만원/명" },
                    { label: "구매 가격", v1: "소매가", v2: "도매가 (더 저렴)" },
                  ].map(({ label, v1, v2 }) => (
                    <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "9px 14px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{label}</td>
                      <td style={{ padding: "9px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#378ADD" }}>{v1}</td>
                      <td style={{ padding: "9px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#E8599A" }}>{v2}</td>
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
