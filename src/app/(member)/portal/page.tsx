"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, ShoppingBag, ChevronRight, ArrowUpRight, Package } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Skeleton, SkeletonStat, SkeletonCard, SkeletonStyle } from "@/components/ui/Skeleton";
import CommissionPlanModal from "@/components/ui/CommissionPlanModal";

const QUICK_MENU = [
  { label: "내 조직", href: "/network", icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.10)" },
  { label: "수당 내역", href: "/earnings", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  { label: "쇼핑몰", href: "/shop", icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.10)" },
  { label: "내 정보", href: "/profile", icon: Package, color: "#A78BFA", bg: "rgba(167,139,250,0.10)" },
];

interface MemberData {
  name: string;
  code: string;
  rank: string;
  rank_color: string;
  personal_pv: number;
  group_gv: number;
  left_volume: number;
  right_volume: number;
  direct_count: number;
}

interface Commission {
  id: string;
  amount: number;
  created_at: string;
  rule: { name: string; rule_type: string } | null;
  source_member: { name: string } | null;
}

export default function PortalPage() {
  const [member, setMember] = useState<MemberData | null>(null);
  const [thisMonth, setThisMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [recentComm, setRecentComm] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { data: m },
        { data: periodThis },
        { data: periodLast },
        { data: directCount },
        { data: commissions },
      ] = await Promise.all([
        supabase.from("members")
          .select("member_code, name, personal_pv, group_gv, left_volume, right_volume, rank:ranks(name, color)")
          .eq("id", session.user.id).single(),
        supabase.from("commissions")
          .select("amount").eq("member_id", session.user.id).gte("created_at", thisMonthStart),
        supabase.from("commissions")
          .select("amount").eq("member_id", session.user.id)
          .gte("created_at", lastMonthStart).lt("created_at", lastMonthEnd),
        supabase.from("members")
          .select("id", { count: "exact", head: true }).eq("sponsor_id", session.user.id),
        supabase.from("commissions")
          .select("id, amount, created_at, rule:commission_rules(name, rule_type), source_member:members!source_member_id(name)")
          .eq("member_id", session.user.id)
          .order("created_at", { ascending: false }).limit(5),
      ]);

      const rank = (m as any)?.rank;
      setMember({
        name: m?.name ?? "—",
        code: (m as any)?.member_code ?? "—",
        rank: rank?.name ?? "파트너",
        rank_color: rank?.color ?? "#C9A84C",
        personal_pv: m?.personal_pv ?? 0,
        group_gv: m?.group_gv ?? 0,
        left_volume: m?.left_volume ?? 0,
        right_volume: m?.right_volume ?? 0,
        direct_count: (directCount as any) ?? 0,
      });

      const tm = periodThis?.reduce((s: number, c: any) => s + c.amount, 0) ?? 0;
      const lm = periodLast?.reduce((s: number, c: any) => s + c.amount, 0) ?? 0;
      setThisMonth(tm);
      setLastMonth(lm);

      // 누적 수당
      const { data: allComm } = await supabase.from("commissions")
        .select("amount").eq("member_id", session.user.id);
      setTotalCommission(allComm?.reduce((s: number, c: any) => s + c.amount, 0) ?? 0);
      setRecentComm((commissions as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  const maxVol = member ? Math.max(member.left_volume, member.right_volume, 1) : 1;

  const typeInfo = (type: string) => {
    if (type === "REFERRAL") return { label: "추천", color: "#C9A84C" };
    if (type === "TEAM") return { label: "간접", color: "#4F8EF7" };
    if (type === "RANK_BONUS") return { label: "직급", color: "#10B981" };
    return { label: "수당", color: "#A78BFA" };
  };

  const formatCommDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <SkeletonStyle />
        <SkeletonCard height={180} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "10px" }}>
          {Array.from({length:4}).map((_,i)=><SkeletonStat key={i}/>)}
        </div>
        <SkeletonCard height={120} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <SkeletonCard height={200} />
          <SkeletonCard height={200} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* 히어로 카드 */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "var(--bg-elevated)",
        border: `1px solid ${member?.rank_color ?? "#C9A84C"}33`,
        borderRadius: "18px", padding: "20px",
      }}>
        <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.06, pointerEvents: "none" }} width="160" height="160" viewBox="0 0 160 160">
          <circle cx="120" cy="40" r="80" fill={member?.rank_color ?? "#C9A84C"} />
        </svg>
        <div style={{ position: "relative" }}>
          {/* 이름 + 이번달 수당 */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", gap: "8px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{
                  padding: "2px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                  background: `${member?.rank_color ?? "#C9A84C"}22`,
                  color: member?.rank_color ?? "#C9A84C",
                  border: `1px solid ${member?.rank_color ?? "#C9A84C"}44`,
                }}>{member?.rank}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "monospace" }}>{member?.code}</span>
              </div>
              <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                {member?.name} 님
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "1px" }}>이번달 수당</p>
              <p style={{ fontFamily: "Syne,sans-serif", fontSize: "24px", fontWeight: 800, color: "var(--gold)" }}>
                {formatKRW(thisMonth)}
              </p>
              {lastMonth > 0 && (
                <p style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", fontSize: "10px", color: growth >= 0 ? "var(--emerald)" : "#F87171", marginTop: "1px" }}>
                  <ArrowUpRight size={11} />{growth >= 0 ? "+" : ""}{growth}% 지난달 대비
                </p>
              )}
            </div>
          </div>

          {/* 실적 4칸 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
            {[
              { label: "개인 PV", value: (member?.personal_pv ?? 0).toLocaleString() },
              { label: "그룹 GV", value: (member?.group_gv ?? 0).toLocaleString() },
              { label: "직추천", value: `${member?.direct_count ?? 0}명` },
              { label: "누적수당", value: totalCommission >= 1000000 ? `₩${(totalCommission/1000000).toFixed(1)}M` : formatKRW(totalCommission) },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(0,0,0,0.15)", borderRadius: "10px", padding: "10px 6px", textAlign: "center" }}>
                <p style={{ fontSize: "9px", color: "var(--text-muted)", marginBottom: "3px" }}>{s.label}</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "10px" }}>
        {QUICK_MENU.map((q) => (
          <Link key={q.label} href={q.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: q.bg,
              border: `1px solid ${q.color}30`,
              borderRadius: "14px", padding: "16px 6px", textAlign: "center",
              transition: "all 0.15s",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "12px",
                margin: "0 auto 8px", background: q.bg,
                border: `1px solid ${q.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <q.icon size={20} color={q.color} />
              </div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{q.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 수당 플랜 보기 버튼 */}
      <button
        onClick={() => setShowPlan(true)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(232,201,122,0.08))",
          border: "1px solid rgba(201,168,76,0.3)", cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,201,122,0.12))"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(232,201,122,0.08))"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", margin: 0 }}>수당 플랜 보기</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>파트너 · 매니저 · 디렉터 수당 체계</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
      </button>

      {showPlan && <CommissionPlanModal onClose={() => setShowPlan(false)} />}

      {/* PC: 조직볼륨 + 최근수당 나란히 / 모바일: 스택 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="max-md:block max-md:space-y-3">

        {/* 조직 볼륨 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>조직 볼륨</h3>
            <Link href="/network" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
              조직 보기 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
            {[
              { side: "좌측", vol: member?.left_volume ?? 0, color: "#C9A84C" },
              { side: "우측", vol: member?.right_volume ?? 0, color: "#4F8EF7" },
            ].map((s) => (
              <div key={s.side}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.side}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{s.vol.toLocaleString()} GV</span>
                </div>
                <div style={{ height: "7px", background: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "4px",
                    background: s.color,
                    width: `${(s.vol / maxVol) * 100}%`,
                    transition: "width 1s ease",
                    opacity: 0.8,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>매칭 볼륨</p>
            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: "var(--gold)" }}>
              {Math.min(member?.left_volume ?? 0, member?.right_volume ?? 0).toLocaleString()} GV
            </p>
          </div>
        </div>

        {/* 최근 수당 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 수당</h3>
            <Link href="/earnings" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
              전체 <ChevronRight size={12} />
            </Link>
          </div>
          {recentComm.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              수당 내역이 없습니다
            </div>
          ) : (
            recentComm.map((c, i) => {
              const ti = typeInfo((c.rule as any)?.rule_type ?? "");
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "11px 14px",
                  borderBottom: i < recentComm.length - 1 ? "1px solid var(--bg-border)" : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: `${ti.color}18`, border: `1px solid ${ti.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 700, color: ti.color, flexShrink: 0,
                  }}>{ti.label}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(c.rule as any)?.name ?? "수당"}{(c.source_member as any)?.name ? ` — ${(c.source_member as any).name}` : ""}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{formatCommDate(c.created_at)}</p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>+{c.amount.toLocaleString()}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
