"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { TrendingUp, Check, Crown, Trophy } from "lucide-react";

const RANK_COLOR: Record<number, string> = { 1: "#6B7280", 2: "#378ADD", 3: "#E8599A" };

interface Cond {
  label: string;
  current: number;
  need: number;
  unit: "명" | "원";
  done: boolean;
}

interface NextRankInfo {
  curName: string;
  nextName: string;
  nextLevel: number;
  color: string;
  conds: Cond[];
  percent: number;
  isMax: boolean;
}

function fmt(n: number, unit: string) {
  if (unit === "명") return `${n}명`;
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}천만`;
  if (n >= 10000) return `${Math.floor(n / 10000)}만`;
  return n.toLocaleString();
}

export default function RankProgressCard() {
  const [info, setInfo] = useState<NextRankInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      // 내 정보
      const { data: me } = await supabase
        .from("members")
        .select("id, group_gv, rank:ranks(level, name)")
        .eq("id", session.user.id).single();
      const myLevel = (me as any)?.rank?.level ?? 1;
      const myName = (me as any)?.rank?.name ?? "멤버";
      const myGv = (me as any)?.group_gv ?? 0;

      // 전체 직급 (조건 포함)
      const { data: ranks } = await supabase
        .from("ranks")
        .select("level, name, min_gv, min_direct_referral")
        .order("level");
      const rankList = (ranks as any[]) ?? [];

      // 직추천 매니저 이상 수 (디렉터 승급 조건용)
      const { data: directs } = await supabase
        .from("members")
        .select("rank:ranks(level)")
        .eq("sponsor_id", session.user.id)
        .eq("is_admin", false);
      const directMgrPlus = (directs as any[] ?? []).filter(d => (d.rank?.level ?? 1) >= 2).length;
      const directAll = (directs as any[] ?? []).length;

      // 다음 직급
      const nextRank = rankList.find(r => r.level === myLevel + 1);
      if (!nextRank) {
        setInfo({ curName: myName, nextName: "", nextLevel: myLevel, color: RANK_COLOR[myLevel] ?? "#C9A84C", conds: [], percent: 100, isMax: true });
        setLoading(false);
        return;
      }

      // 조건 구성
      const conds: Cond[] = [];
      // 산하 누적 매출
      if ((nextRank.min_gv ?? 0) > 0) {
        conds.push({
          label: "산하 누적 매출",
          current: Math.min(myGv, nextRank.min_gv),
          need: nextRank.min_gv,
          unit: "원",
          done: myGv >= nextRank.min_gv,
        });
      }
      // 직추천 수 (매니저→디렉터는 매니저 이상, 그 외는 전체)
      if ((nextRank.min_direct_referral ?? 0) > 0) {
        const cur = myLevel === 2 ? directMgrPlus : directAll;
        conds.push({
          label: myLevel === 2 ? "직추천 매니저" : "직추천",
          current: Math.min(cur, nextRank.min_direct_referral),
          need: nextRank.min_direct_referral,
          unit: "명",
          done: cur >= nextRank.min_direct_referral,
        });
      }

      // 진행률 = 조건별 달성률 평균
      const percent = conds.length > 0
        ? Math.floor(conds.reduce((s, c) => s + Math.min(c.current / c.need, 1), 0) / conds.length * 100)
        : 0;

      setInfo({
        curName: myName,
        nextName: nextRank.name,
        nextLevel: nextRank.level,
        color: RANK_COLOR[nextRank.level] ?? "#C9A84C",
        conds,
        percent,
        isMax: false,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !info) return null;

  // 최고 직급 도달
  if (info.isMax) {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(232,89,154,0.12), rgba(232,89,154,0.04))",
        border: "1px solid rgba(232,89,154,0.3)", borderRadius: "16px", padding: "18px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(232,89,154,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Crown size={22} color="#E8599A" />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 800, color: "#E8599A", margin: 0 }}>최고 직급 달성 🎉</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>{info.curName} — 본부장 도전(디렉터 3명 + 산하 1억)으로 더 높이!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <Trophy size={16} color={info.color} />
        <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>승급까지</p>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{info.curName}</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→</span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: info.color }}>{info.nextName}</span>
        </span>
      </div>

      {/* 진행률 게이지 */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
          <span style={{ fontFamily: "Syne,sans-serif", fontSize: "32px", fontWeight: 900, color: info.color, lineHeight: 1 }}>{info.percent}%</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>달성</span>
        </div>
        <div style={{ height: "12px", background: "var(--bg-border)", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${info.percent}%`,
            background: `linear-gradient(90deg, ${info.color}cc, ${info.color})`,
            borderRadius: "6px", transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* 조건별 상세 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {info.conds.map((c, i) => {
          const remain = Math.max(c.need - c.current, 0);
          const pct = Math.min(Math.floor(c.current / c.need * 100), 100);
          return (
            <div key={i} style={{ background: "var(--bg)", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {c.done && <Check size={13} color="#10B981" />}
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: c.done ? "#10B981" : info.color }}>
                  {fmt(c.current, c.unit)} / {fmt(c.need, c.unit)}
                </span>
              </div>
              <div style={{ height: "5px", background: "var(--bg-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: c.done ? "#10B981" : info.color, borderRadius: "3px", transition: "width 0.5s" }} />
              </div>
              {!c.done && (
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "5px 0 0" }}>
                  {c.unit === "명" ? `${remain}명 더 모집하면 달성` : `${fmt(remain, "원")}원 더 채우면 달성`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 독려 메시지 */}
      <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "10px", background: `${info.color}10`, border: `1px solid ${info.color}25`, display: "flex", alignItems: "center", gap: "8px" }}>
        <TrendingUp size={14} color={info.color} />
        <p style={{ fontSize: "12px", fontWeight: 600, color: info.color, margin: 0 }}>
          {info.percent >= 80 ? "거의 다 왔어요! 조금만 더 하면 승급입니다 🔥"
            : info.percent >= 40 ? "순조롭게 진행 중! 꾸준히 모집해보세요"
            : `${info.nextName} 승급을 향해 첫걸음을 떼어보세요`}
        </p>
      </div>
    </div>
  );
}
