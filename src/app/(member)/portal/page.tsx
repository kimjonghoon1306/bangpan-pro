"use client";

import { TrendingUp, Users, Wallet, ShoppingBag, ChevronRight, ArrowUpRight, Package } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import Link from "next/link";

const MEMBER = {
  name: "김민수", code: "M-012847", rank: "골드", rank_color: "#C9A84C",
  personal_pv: 850, group_gv: 12400, left_volume: 6800, right_volume: 5600,
  this_month: 247000, last_month: 198000, total: 4820000, direct: 8,
};

const RECENT_COMMISSIONS = [
  { desc: "직접추천수당 — 박지현", amount: 32000, date: "07.01", type: "추천", color: "#C9A84C" },
  { desc: "직접추천수당 — 오민정", amount: 45000, date: "07.01", type: "추천", color: "#C9A84C" },
  { desc: "간접수당 — 이준호", amount: 6000, date: "07.01", type: "간접", color: "#4F8EF7" },
  { desc: "간접수당 — 강동현", amount: 4000, date: "06.30", type: "간접", color: "#4F8EF7" },
];

const QUICK_MENU = [
  { label: "내 조직", href: "/network", icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.08)" },
  { label: "수당 내역", href: "/earnings", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { label: "쇼핑몰", href: "/shop", icon: ShoppingBag, color: "#4F8EF7", bg: "rgba(79,142,247,0.08)" },
  { label: "내 정보", href: "/profile", icon: Package, color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
];

export default function PortalPage() {
  const growth = Math.round(((MEMBER.this_month - MEMBER.last_month) / MEMBER.last_month) * 100);
  const maxVol = Math.max(MEMBER.left_volume, MEMBER.right_volume);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">

      {/* 좌측 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 히어로 카드 */}
        <div style={{ position: "relative", overflow: "hidden", background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", padding: "24px" }}>
          <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.06, pointerEvents: "none" }} width="180" height="180" viewBox="0 0 180 180">
            <circle cx="140" cy="40" r="90" fill="var(--gold)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(201,168,76,0.03) 0%, transparent 60%)", borderRadius: "20px" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>{MEMBER.rank}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{MEMBER.code}</span>
                </div>
                <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>{MEMBER.name} 님</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>이번달 수당</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "28px", fontWeight: 800, color: "var(--gold)" }}>{formatKRW(MEMBER.this_month)}</p>
                <p style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px", fontSize: "11px", color: "var(--emerald)", marginTop: "2px" }}>
                  <ArrowUpRight size={12} />+{growth}% 지난달 대비
                </p>
              </div>
            </div>

            {/* 실적 그리드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[
                { label: "개인 PV", value: MEMBER.personal_pv.toLocaleString() },
                { label: "그룹 GV", value: MEMBER.group_gv.toLocaleString() },
                { label: "직추천", value: `${MEMBER.direct}명` },
                { label: "누적수당", value: "₩4.8M" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(0,0,0,0.15)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{s.label}</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 조직 볼륨 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>조직 볼륨</h3>
            <Link href="/network" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>조직 보기 <ChevronRight size={13} /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
            {[
              { side: "좌측", vol: MEMBER.left_volume, color: "#C9A84C" },
              { side: "우측", vol: MEMBER.right_volume, color: "#4F8EF7" },
            ].map((s) => (
              <div key={s.side}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.side}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{s.vol.toLocaleString()} GV</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, width: `${maxVol > 0 ? (s.vol / maxVol) * 100 : 0}%`, transition: "width 1s ease", boxShadow: `0 0 8px ${s.color}44` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>매칭 볼륨</p>
            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--gold)" }}>
              {Math.min(MEMBER.left_volume, MEMBER.right_volume).toLocaleString()} GV
            </p>
          </div>
        </div>

        {/* 빠른 메뉴 — 모바일에서만 보임 */}
        <div className="lg:hidden" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {QUICK_MENU.map((q) => (
            <Link key={q.label} href={q.href} style={{ textDecoration: "none" }}>
              <div style={{ background: q.bg, border: `1px solid ${q.bg.replace("0.08","0.2")}`, borderRadius: "14px", padding: "16px 8px", textAlign: "center", transition: "all 0.15s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "12px", margin: "0 auto 8px", background: q.bg, border: `1px solid ${q.bg.replace("0.08","0.25")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <q.icon size={20} color={q.color} />
                </div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{q.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 우측 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 빠른 메뉴 — PC에서만 */}
        <div className="hidden lg:block" style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>빠른 메뉴</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {QUICK_MENU.map((q) => (
              <Link key={q.label} href={q.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", background: q.bg, border: `1px solid ${q.bg.replace("0.08","0.15")}`, transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateX(2px)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateX(0)"}
              >
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: q.bg, border: `1px solid ${q.bg.replace("0.08","0.25")}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <q.icon size={18} color={q.color} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{q.label}</span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 수당 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--bg-border)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>최근 수당</h3>
            <Link href="/earnings" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>전체 <ChevronRight size={13} /></Link>
          </div>
          <div>
            {RECENT_COMMISSIONS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < RECENT_COMMISSIONS.length-1 ? "1px solid var(--bg-border)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: `${c.color}18`, border: `1px solid ${c.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.type}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.date}</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>+{c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
