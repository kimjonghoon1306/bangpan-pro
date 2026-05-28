"use client";

import { useState, useEffect } from "react";
import { Wallet, Download } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface CommItem {
  id: string;
  amount: number;
  base_amount: number;
  rate: number | null;
  created_at: string;
  rule: { name: string; rule_type: string } | null;
  source_member: { name: string; member_code: string } | null;
}

interface Period { year: number; month: number; label: string }

const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  REFERRAL:   { label: "추천", color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  TEAM:       { label: "간접", color: "#4F8EF7", bg: "rgba(79,142,247,0.12)" },
  RANK_BONUS: { label: "직급", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  MATCHING:   { label: "매칭", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
};

export default function EarningsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selected, setSelected] = useState<Period | null>(null);
  const [items, setItems] = useState<CommItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  // 최근 4개월 기간 생성
  useEffect(() => {
    const now = new Date();
    const ps: Period[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      ps.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}` });
    }
    setPeriods(ps);
    setSelected(ps[0]);
  }, []);

  // 기간별 수당 로드
  useEffect(() => {
    if (!selected) return;
    async function load() {
      setLoadingItems(true);
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const start = new Date(selected!.year, selected!.month - 1, 1).toISOString();
      const end   = new Date(selected!.year, selected!.month, 1).toISOString();

      const { data } = await supabase
        .from("commissions")
        .select("id, amount, base_amount, rate, created_at, rule:commission_rules(name, rule_type), source_member:members!source_member_id(name, member_code)")
        .eq("member_id", session.user.id)
        .gte("created_at", start).lt("created_at", end)
        .order("created_at", { ascending: false });

      setItems((data as any) ?? []);
      setLoadingItems(false);
      if (loading) setLoading(false);
    }
    load();
  }, [selected]);

  const total = items.reduce((s, c) => s + c.amount, 0);
  const net = Math.floor(total * 0.967);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>수당 내역</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>월별 수당 상세</p>
        </div>
        <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}>
          <Download size={14} /> 지급명세서
        </button>
      </div>

      {/* 월 선택 */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
        {periods.map((p) => (
          <button key={p.label} onClick={() => setSelected(p)} style={{
            padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            background: selected?.label === p.label ? "rgba(201,168,76,0.15)" : "var(--bg-elevated)",
            border: `1px solid ${selected?.label === p.label ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
            color: selected?.label === p.label ? "var(--gold)" : "var(--text-secondary)",
          }}>{p.label}</button>
        ))}
      </div>

      {/* 합계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Wallet size={14} color="var(--gold)" />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>총 수당</span>
          </div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--gold)" }}>{formatKRW(total)}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>실수령액 (3.3% 공제)</div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{formatKRW(net)}</p>
        </div>
      </div>

      {/* 목록 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>상세 내역</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{items.length}건</span>
        </div>
        {loadingItems ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>이 기간 수당 내역이 없습니다</div>
        ) : (
          items.map((c, i) => {
            const ti = TYPE_MAP[(c.rule as any)?.rule_type ?? ""] ?? { label: "수당", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" };
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                borderBottom: i < items.length - 1 ? "1px solid var(--bg-border)" : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "10px",
                  background: ti.bg, border: `1px solid ${ti.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color: ti.color, flexShrink: 0,
                }}>{ti.label}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(c.rule as any)?.name ?? "수당"}
                    {(c.source_member as any)?.name ? ` — ${(c.source_member as any).name}` : ""}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatDate(c.created_at)}
                    {c.base_amount > 0 && c.rate ? ` · ${c.base_amount.toLocaleString()}원 × ${c.rate}%` : ""}
                  </p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                  +{c.amount.toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
