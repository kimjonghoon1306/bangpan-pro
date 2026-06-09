"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Target, Phone, Rocket, UserPlus, TrendingUp, CheckCircle2, ChevronRight } from "lucide-react";

// 직급별 창업비 (실 기준)
const FEE: Record<number, number> = { 1: 50000, 2: 3000000, 3: 5000000 };

interface ActionItem {
  priority: number;          // 낮을수록 우선
  icon: any;
  color: string;
  bg: string;
  title: string;
  desc: string;
  tag?: string;
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function NextActionCard() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      // 내 정보
      const { data: me } = await supabase
        .from("members")
        .select("id, name, joined_at, group_gv, rank:ranks(level, name)")
        .eq("id", session.user.id).single();

      const myLevel = (me as any)?.rank?.level ?? 1;
      const myGv = (me as any)?.group_gv ?? 0;
      setMyName((me as any)?.name ?? "");

      // 내 직속 팀원 (직추천 1대)
      const { data: team } = await supabase
        .from("members")
        .select("id, name, joined_at, group_gv, rank:ranks(level, name)")
        .eq("sponsor_id", session.user.id)
        .eq("is_admin", false);

      // 각 팀원이 또 추천한 수 (첫모집 여부 판단)
      const teamList = (team as any[]) ?? [];
      const recruitCounts: Record<string, number> = {};
      if (teamList.length > 0) {
        const ids = teamList.map(t => t.id);
        const { data: subs } = await supabase
          .from("members")
          .select("sponsor_id")
          .in("sponsor_id", ids);
        (subs as any[] ?? []).forEach(s => {
          recruitCounts[s.sponsor_id] = (recruitCounts[s.sponsor_id] ?? 0) + 1;
        });
      }

      const items: ActionItem[] = [];

      // ── 규칙 1: 내가 본인 창업 후 첫 모집이 없음 (가입 D+3 이상, 직추천 0명)
      const myDays = daysSince((me as any)?.joined_at);
      if (teamList.length === 0 && myDays >= 3) {
        items.push({
          priority: 1,
          icon: UserPlus, color: "#10B981", bg: "rgba(16,185,129,0.1)",
          title: "첫 창업자를 모집하세요",
          desc: `가입 ${myDays}일째 — 수입은 창업자를 모집해야 시작됩니다. 한 명만 모집해도 판권 수당이 발생합니다.`,
          tag: "수입 시작",
        });
      }

      // ── 규칙 2: 팀원별 — 가입했지만 아직 첫 모집 없음
      for (const t of teamList) {
        const d = daysSince(t.joined_at);
        const recruited = recruitCounts[t.id] ?? 0;
        if (recruited === 0 && d >= 5 && d <= 90) {
          items.push({
            priority: 2,
            icon: Phone, color: "#EF9F27", bg: "rgba(239,159,39,0.1)",
            title: `${t.name}님 첫 모집 독려`,
            desc: `가입 ${d}일째인데 아직 첫 모집이 없습니다. 연락해서 첫 창업자 모집을 도와주세요. (모집 성공 시 나에게 팀원 첫모집 보너스)`,
            tag: "팀 관리",
          });
        }
      }

      // ── 규칙 3: 팀원 패스트스타트 마감 임박 (가입 D+75~89, 첫모집 없음)
      for (const t of teamList) {
        const d = daysSince(t.joined_at);
        const left = 90 - d;
        const recruited = recruitCounts[t.id] ?? 0;
        if (left > 0 && left <= 15 && recruited === 0) {
          items.push({
            priority: 0, // 최우선 (마감 임박)
            icon: Rocket, color: "#F472B6", bg: "rgba(244,114,182,0.1)",
            title: `${t.name}님 패스트스타트 D-${left}`,
            desc: `90일 패스트스타트 보너스 마감이 ${left}일 남았습니다. 지금 독려하면 추가 수당을 받을 수 있습니다.`,
            tag: "마감 임박",
          });
        }
      }

      // ── 규칙 4: 승급 임박 (매니저 → 디렉터, 산하 2,000만 근접)
      if (myLevel === 2) {
        const need = 20000000;
        const remain = need - myGv;
        if (remain > 0 && remain <= 5000000) {
          items.push({
            priority: 1,
            icon: TrendingUp, color: "#E8599A", bg: "rgba(232,89,154,0.1)",
            title: "디렉터 승급 임박!",
            desc: `산하 누적 ${remain.toLocaleString()}원만 더 채우면 디렉터로 승급합니다. 매니저 1명만 더 모집해보세요.`,
            tag: "승급 임박",
          });
        }
      }

      // 우선순위 정렬, 최대 4개
      items.sort((a, b) => a.priority - b.priority);
      setActions(items.slice(0, 4));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;

  // 할 일이 없으면 격려 메시지
  if (actions.length === 0) {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))",
        border: "1px solid rgba(16,185,129,0.25)", borderRadius: "16px", padding: "16px 18px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ width: 40, height: 40, borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckCircle2 size={20} color="#10B981" />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#10B981", margin: 0 }}>오늘 급한 할 일이 없습니다 👍</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>팀이 잘 굴러가고 있어요. 새 창업자 모집으로 더 키워보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", borderBottom: "1px solid var(--bg-border)", background: "rgba(201,168,76,0.06)" }}>
        <Target size={16} color="#C9A84C" />
        <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>오늘 할 일</p>
        <span style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: "999px", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", fontSize: "11px", fontWeight: 700, color: "#C9A84C" }}>
          {actions.length}건
        </span>
      </div>

      {/* 액션 목록 */}
      <div>
        {actions.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            padding: "14px 16px",
            borderBottom: i < actions.length - 1 ? "1px solid var(--bg-border)" : "none",
          }}>
            <div style={{ width: 38, height: 38, borderRadius: "11px", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <a.icon size={18} color={a.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{a.title}</p>
                {a.tag && (
                  <span style={{ padding: "1px 7px", borderRadius: "999px", background: `${a.color}18`, border: `1px solid ${a.color}33`, fontSize: "9px", fontWeight: 700, color: a.color }}>{a.tag}</span>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
