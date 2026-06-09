"use client";

import { useState } from "react";
import {
  Eye, Target, Phone, Rocket, UserPlus, TrendingUp, Trophy, Check,
  HeartPulse, UserX, Clock, Users, Smartphone, Monitor,
} from "lucide-react";

// ─── 데모 데이터 ─────────────────────────────────────

// 1) 오늘 할 일
const DEMO_ACTIONS = [
  { icon: Rocket, color: "#F472B6", bg: "rgba(244,114,182,0.1)", title: "박민준님 패스트스타트 D-9", desc: "90일 보너스 마감이 9일 남았습니다. 지금 독려하면 추가 수당을 받을 수 있습니다.", tag: "마감 임박" },
  { icon: TrendingUp, color: "#E8599A", bg: "rgba(232,89,154,0.1)", title: "디렉터 승급 임박!", desc: "산하 누적 400만원만 더 채우면 디렉터로 승급합니다. 매니저 1명만 더 모집해보세요.", tag: "승급 임박" },
  { icon: Phone, color: "#EF9F27", bg: "rgba(239,159,39,0.1)", title: "김철수님 첫 모집 독려", desc: "가입 12일째인데 아직 첫 모집이 없습니다. 연락해서 첫 창업자 모집을 도와주세요.", tag: "팀 관리" },
];

// 2) 승급 게이지
const DEMO_RANK = {
  curName: "매니저", nextName: "디렉터", color: "#E8599A", percent: 80,
  conds: [
    { label: "직추천 매니저", current: 3, need: 3, unit: "명", done: true },
    { label: "산하 누적 매출", current: 16000000, need: 20000000, unit: "원", done: false },
  ],
};

// 3) 회원 케어
const DEMO_CARE = [
  { name: "박민준", rankName: "매니저", rankColor: "#378ADD", cat: "fast", catLabel: "패스트 마감 임박", catColor: "#F472B6", catBg: "rgba(244,114,182,0.1)", icon: Rocket, extra: "D-9", sponsor: "홍길동", phone: "010-1234-5678" },
  { name: "김철수", rankName: "매니저", rankColor: "#378ADD", cat: "first", catLabel: "첫 모집 없음", catColor: "#EF9F27", catBg: "rgba(239,159,39,0.1)", icon: UserX, extra: "가입 12일째", sponsor: "홍길동", phone: "010-2345-6789" },
  { name: "이영희", rankName: "멤버", rankColor: "#6B7280", cat: "idle", catLabel: "장기 미활동", catColor: "#9CA3AF", catBg: "rgba(156,163,175,0.1)", icon: Clock, extra: "가입 45일째", sponsor: "김철수", phone: "" },
];

function fmtMoney(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}천만`;
  if (n >= 10000) return `${Math.floor(n / 10000)}만`;
  return n.toLocaleString();
}

const TABS = [
  { key: "action", label: "오늘 할 일", icon: Target, where: "회원 포털" },
  { key: "rank",   label: "승급 게이지", icon: Trophy, where: "회원 포털" },
  { key: "care",   label: "회원 케어",   icon: HeartPulse, where: "관리자" },
] as const;
type Tab = typeof TABS[number]["key"];

export default function PreviewPage() {
  const [tab, setTab] = useState<Tab>("action");

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: 40, height: 40, borderRadius: "12px", background: "rgba(108,71,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Eye size={20} color="#6C47FF" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>기능 미리보기</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>실제 회원 데이터가 쌓이면 이렇게 작동합니다 (예시 데이터)</p>
        </div>
      </div>

      {/* 안내 배너 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: "rgba(108,71,255,0.07)", border: "1px solid rgba(108,71,255,0.25)" }}>
        <span style={{ fontSize: "18px" }}>💡</span>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          아래는 <strong>설명용 예시</strong>입니다. 회원이 가입하고 조직이 만들어지면, 각자의 실제 데이터로 자동 계산되어 회원 포털·관리자 화면에 나타납니다.
        </p>
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 16px", borderRadius: "12px", cursor: "pointer",
            fontSize: "13px", fontWeight: 700, transition: "all 0.15s",
            background: tab === t.key ? "rgba(108,71,255,0.15)" : "var(--bg-elevated)",
            border: `1.5px solid ${tab === t.key ? "#6C47FF" : "var(--bg-border)"}`,
            color: tab === t.key ? "#6C47FF" : "var(--text-muted)",
          }}>
            <t.icon size={14} /> {t.label}
            <span style={{ padding: "1px 7px", borderRadius: "999px", background: tab === t.key ? "rgba(108,71,255,0.2)" : "var(--bg-border)", fontSize: "9px", fontWeight: 700, color: tab === t.key ? "#6C47FF" : "var(--text-muted)" }}>
              {t.where}
            </span>
          </button>
        ))}
      </div>

      {/* 미리보기 영역 (모바일 프레임 느낌) */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "14px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", color: "var(--text-muted)", fontSize: "11px" }}>
            {tab === "care" ? <Monitor size={13} /> : <Smartphone size={13} />}
            {tab === "care" ? "관리자 화면" : "회원이 보는 화면"}
          </div>

          {/* ── 1) 오늘 할 일 ── */}
          {tab === "action" && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", borderBottom: "1px solid var(--bg-border)", background: "rgba(201,168,76,0.06)" }}>
                <Target size={16} color="#C9A84C" />
                <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>오늘 할 일</p>
                <span style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: "999px", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", fontSize: "11px", fontWeight: 700, color: "#C9A84C" }}>3건</span>
              </div>
              {DEMO_ACTIONS.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderBottom: i < DEMO_ACTIONS.length - 1 ? "1px solid var(--bg-border)" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "11px", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <a.icon size={18} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{a.title}</p>
                      <span style={{ padding: "1px 7px", borderRadius: "999px", background: `${a.color}18`, border: `1px solid ${a.color}33`, fontSize: "9px", fontWeight: 700, color: a.color }}>{a.tag}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 2) 승급 게이지 ── */}
          {tab === "rank" && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Trophy size={16} color={DEMO_RANK.color} />
                <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>승급까지</p>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{DEMO_RANK.curName}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: DEMO_RANK.color }}>{DEMO_RANK.nextName}</span>
                </span>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "Syne,sans-serif", fontSize: "32px", fontWeight: 900, color: DEMO_RANK.color, lineHeight: 1 }}>{DEMO_RANK.percent}%</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>달성</span>
                </div>
                <div style={{ height: "12px", background: "var(--bg-border)", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${DEMO_RANK.percent}%`, background: `linear-gradient(90deg, ${DEMO_RANK.color}cc, ${DEMO_RANK.color})`, borderRadius: "6px" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {DEMO_RANK.conds.map((c, i) => {
                  const pct = Math.min(Math.floor(c.current / c.need * 100), 100);
                  const remain = Math.max(c.need - c.current, 0);
                  return (
                    <div key={i} style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {c.done && <Check size={13} color="#10B981" />}
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: c.done ? "#10B981" : DEMO_RANK.color }}>
                          {c.unit === "명" ? `${c.current}명 / ${c.need}명` : `${fmtMoney(c.current)} / ${fmtMoney(c.need)}`}
                        </span>
                      </div>
                      <div style={{ height: "5px", background: "var(--bg-border)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: c.done ? "#10B981" : DEMO_RANK.color, borderRadius: "3px" }} />
                      </div>
                      {!c.done && <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "5px 0 0" }}>{fmtMoney(remain)}원 더 채우면 달성</p>}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "10px", background: `${DEMO_RANK.color}10`, border: `1px solid ${DEMO_RANK.color}25`, display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={14} color={DEMO_RANK.color} />
                <p style={{ fontSize: "12px", fontWeight: 600, color: DEMO_RANK.color, margin: 0 }}>거의 다 왔어요! 조금만 더 하면 승급입니다 🔥</p>
              </div>
            </div>
          )}

          {/* ── 3) 회원 케어 ── */}
          {tab === "care" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {DEMO_CARE.map((m, i) => (
                <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderLeft: `3px solid ${m.catColor}`, borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${m.rankColor}22`, border: `1.5px solid ${m.rankColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: m.rankColor }}>{m.name[0]}</div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{m.name}</p>
                        <span style={{ fontSize: "11px", color: m.rankColor, fontWeight: 600 }}>{m.rankName}</span>
                      </div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "999px", background: m.catBg, border: `1px solid ${m.catColor}33`, fontSize: "10px", fontWeight: 700, color: m.catColor, whiteSpace: "nowrap" }}>
                      <m.icon size={11} /> {m.extra}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: "var(--bg)", marginBottom: "8px" }}>
                    <Users size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>담당 추천인</span>
                    <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{m.sponsor}</span>
                  </div>
                  {m.phone ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", borderRadius: "10px", background: `${m.catColor}15`, border: `1px solid ${m.catColor}33`, color: m.catColor, fontSize: "12px", fontWeight: 700 }}>
                      <Phone size={13} /> {m.phone}
                    </div>
                  ) : (
                    <span style={{ display: "block", textAlign: "center", padding: "9px", borderRadius: "10px", background: "var(--bg)", color: "var(--text-muted)", fontSize: "12px" }}>연락처 없음</span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 설명 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px 18px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
          {tab === "action" ? "🎯 오늘 할 일 — 회원 포털" : tab === "rank" ? "🏆 승급 게이지 — 회원 포털" : "💗 회원 케어 — 관리자 전용"}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          {tab === "action" && "회원이 포털에 들어오면, 가입일·조직 데이터를 분석해 '지금 해야 할 일'을 자동으로 띄웁니다. 가입 후 방치되어 이탈하는 것을 막아줍니다."}
          {tab === "rank" && "회원이 다음 직급까지 얼마나 남았는지 실시간 진행률로 보여줍니다. '매니저 1명만 더'처럼 구체적인 행동을 제시해 동기를 부여합니다."}
          {tab === "care" && "관리자가 방치·이탈 위험 회원을 자동으로 찾아, 담당 추천인과 연락처를 함께 봅니다. 전화 바로걸기·명단 복사로 즉시 케어할 수 있습니다."}
        </p>
      </div>
    </div>
  );
}
