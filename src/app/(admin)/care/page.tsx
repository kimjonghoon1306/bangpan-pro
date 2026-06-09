"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { HeartPulse, Phone, Rocket, Clock, UserX, AlertTriangle, Copy, Check, Users } from "lucide-react";

const RANK_COLOR: Record<number, string> = { 1: "#6B7280", 2: "#378ADD", 3: "#E8599A" };

type Category = "first" | "fast" | "idle";

interface CareMember {
  id: string;
  name: string;
  code: string;
  phone: string;
  rankLevel: number;
  rankName: string;
  days: number;        // 가입 경과일
  sponsorName: string; // 담당 추천인
  sponsorPhone: string;
  category: Category;
  extra?: string;      // 부가 정보 (예: D-12)
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

const CAT_META: Record<Category, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  fast:  { label: "패스트 마감 임박", color: "#F472B6", bg: "rgba(244,114,182,0.1)", icon: Rocket, desc: "90일 패스트스타트 마감이 임박했으나 아직 첫 모집이 없는 회원" },
  first: { label: "첫 모집 없음",     color: "#EF9F27", bg: "rgba(239,159,39,0.1)",  icon: UserX,  desc: "가입 7일 이상 지났지만 아직 한 명도 모집하지 못한 회원" },
  idle:  { label: "장기 미활동",      color: "#9CA3AF", bg: "rgba(156,163,175,0.1)", icon: Clock,  desc: "가입 30일 이상, 활동이 거의 없는 회원" },
};

export default function CarePage() {
  const [members, setMembers] = useState<CareMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();

      // 전체 회원
      const { data: all } = await supabase
        .from("members")
        .select("id, name, member_code, phone, sponsor_id, joined_at, rank:ranks(level, name)")
        .eq("is_admin", false);
      const list = (all as any[]) ?? [];

      const byId: Record<string, any> = {};
      list.forEach(m => { byId[m.id] = m; });

      // 각 회원의 직추천 수
      const recruitCount: Record<string, number> = {};
      list.forEach(m => {
        if (m.sponsor_id) recruitCount[m.sponsor_id] = (recruitCount[m.sponsor_id] ?? 0) + 1;
      });

      const result: CareMember[] = [];
      for (const m of list) {
        const d = daysSince(m.joined_at);
        const recruited = recruitCount[m.id] ?? 0;
        const sponsor = m.sponsor_id ? byId[m.sponsor_id] : null;
        const base = {
          id: m.id, name: m.name, code: m.member_code, phone: m.phone ?? "",
          rankLevel: m.rank?.level ?? 1, rankName: m.rank?.name ?? "멤버", days: d,
          sponsorName: sponsor?.name ?? "—", sponsorPhone: sponsor?.phone ?? "",
        };

        // 우선순위: 패스트 마감 임박 > 첫 모집 없음 > 장기 미활동
        const fastLeft = 90 - d;
        if (recruited === 0 && fastLeft > 0 && fastLeft <= 15) {
          result.push({ ...base, category: "fast", extra: `D-${fastLeft}` });
        } else if (recruited === 0 && d >= 7 && d < 75) {
          result.push({ ...base, category: "first", extra: `가입 ${d}일째` });
        } else if (recruited === 0 && d >= 30) {
          result.push({ ...base, category: "idle", extra: `가입 ${d}일째` });
        }
      }

      // 정렬: fast → first → idle, 같은 카테고리는 경과일 많은 순
      const order: Record<Category, number> = { fast: 0, first: 1, idle: 2 };
      result.sort((a, b) => order[a.category] - order[b.category] || b.days - a.days);
      setMembers(result);
      setLoading(false);
    }
    load();
  }, []);

  const counts = {
    all: members.length,
    fast: members.filter(m => m.category === "fast").length,
    first: members.filter(m => m.category === "first").length,
    idle: members.filter(m => m.category === "idle").length,
  };
  const shown = filter === "all" ? members : members.filter(m => m.category === filter);

  function copyList() {
    const text = shown.map(m =>
      `[${CAT_META[m.category].label}] ${m.name}(${m.rankName}) ${m.phone || "연락처없음"} · 담당:${m.sponsorName} · ${m.extra}`
    ).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied("list");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "12px", background: "rgba(232,89,154,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HeartPulse size={20} color="#E8599A" />
          </div>
          <div>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>회원 케어 센터</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>방치·이탈 위험 회원을 자동으로 찾아 담당자와 연결합니다</p>
          </div>
        </div>
        {shown.length > 0 && (
          <button onClick={copyList} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            {copied === "list" ? <><Check size={14} color="#10B981" /> 복사됨</> : <><Copy size={14} /> 명단 복사</>}
          </button>
        )}
      </div>

      {/* 필터 탭 */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {([
          { key: "all" as const, label: "전체", color: "#C9A84C", count: counts.all },
          { key: "fast" as const, label: CAT_META.fast.label, color: CAT_META.fast.color, count: counts.fast },
          { key: "first" as const, label: CAT_META.first.label, color: CAT_META.first.color, count: counts.first },
          { key: "idle" as const, label: CAT_META.idle.label, color: CAT_META.idle.color, count: counts.idle },
        ]).map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
            fontSize: "13px", fontWeight: 700, transition: "all 0.15s",
            background: filter === t.key ? `${t.color}20` : "var(--bg-elevated)",
            border: `1.5px solid ${filter === t.key ? t.color : "var(--bg-border)"}`,
            color: filter === t.key ? t.color : "var(--text-muted)",
          }}>
            {t.label}
            <span style={{ padding: "0 7px", borderRadius: "999px", background: `${t.color}25`, color: t.color, fontSize: "11px", fontWeight: 800 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* 안내 */}
      {filter !== "all" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", background: CAT_META[filter].bg, border: `1px solid ${CAT_META[filter].color}33` }}>
          <AlertTriangle size={14} color={CAT_META[filter].color} />
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>{CAT_META[filter].desc}</p>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
      ) : shown.length === 0 ? (
        <div style={{ padding: "48px 20px", textAlign: "center", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>케어가 필요한 회원이 없습니다</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>모든 회원이 잘 활동하고 있어요</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
          {shown.map(m => {
            const meta = CAT_META[m.category];
            const rc = RANK_COLOR[m.rankLevel] ?? "#6B7280";
            return (
              <div key={m.id} style={{ background: "var(--bg-elevated)", border: `1px solid var(--bg-border)`, borderLeft: `3px solid ${meta.color}`, borderRadius: "14px", padding: "16px" }}>
                {/* 상단: 이름 + 카테고리 */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${rc}22`, border: `1.5px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: rc }}>{m.name[0]}</div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{m.name}</p>
                      <span style={{ fontSize: "11px", color: rc, fontWeight: 600 }}>{m.rankName}</span>
                    </div>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "999px", background: meta.bg, border: `1px solid ${meta.color}33`, fontSize: "10px", fontWeight: 700, color: meta.color, whiteSpace: "nowrap" }}>
                    <meta.icon size={11} /> {m.extra}
                  </span>
                </div>

                {/* 담당 추천인 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: "var(--bg)", marginBottom: "8px" }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>담당 추천인</span>
                  <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{m.sponsorName}</span>
                </div>

                {/* 연락처 */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {m.phone ? (
                    <a href={`tel:${m.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", borderRadius: "10px", background: `${meta.color}15`, border: `1px solid ${meta.color}33`, color: meta.color, textDecoration: "none", fontSize: "12px", fontWeight: 700 }}>
                      <Phone size={13} /> {m.phone}
                    </a>
                  ) : (
                    <span style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: "10px", background: "var(--bg)", color: "var(--text-muted)", fontSize: "12px" }}>연락처 없음</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
