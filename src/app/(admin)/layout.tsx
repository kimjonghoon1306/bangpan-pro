"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  LayoutDashboard, Users, ShoppingBag, Calculator,
  Settings, TrendingUp, LogOut, GitBranch,
  Wallet, Package, Bell, Menu, X, ChevronLeft, ExternalLink, CheckCircle,
  Calendar as CalendarIcon, Banknote as BanknoteIcon, BookOpen, HeartPulse, Eye,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CommissionPlanModal from "@/components/ui/CommissionPlanModal";

const NAV_GROUPS = [
  {
    color: "var(--text-secondary)",
    items: [
      { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "회원",
    color: "#6C47FF",   // violet — 사람
    items: [
      { label: "회원 관리", href: "/members", icon: Users },
      { label: "조직도",    href: "/org",     icon: GitBranch },
      { label: "회원 케어", href: "/care",    icon: HeartPulse, highlight: true, color: "#E8599A" },
    ],
  },
  {
    label: "영업",
    color: "#2563EB",   // blue — 운영·거래
    items: [
      { label: "매출 관리", href: "/sales",    icon: TrendingUp },
      { label: "주문 관리", href: "/orders",   icon: ShoppingBag },
      { label: "상품 관리", href: "/products", icon: Package },
    ],
  },
  {
    label: "정산",
    color: "var(--gold)", // gold — 수당·돈
    items: [
      { label: "수당 플랜",   href: "/plan",              icon: Calculator,   highlight: true },
      { label: "수당 설명서", href: "/commission-guide",  icon: BookOpen,     highlight: true },
      { label: "정산 관리",   href: "/settlement",  icon: Wallet },
      { label: "마감 · 정산", href: "/closing",     icon: CheckCircle,  highlight: true, color: "#FF2D78" },
      { label: "지급 캘린더", href: "/calendar",    icon: CalendarIcon, highlight: true, color: "#FF2D78" },
      { label: "출금 신청",   href: "/withdrawals", icon: BanknoteIcon },
    ],
  },
  {
    label: "설정",
    color: "var(--text-muted)",
    items: [
      { label: "기능 미리보기", href: "/preview", icon: Eye },
      { label: "시스템 설정", href: "/settings", icon: Settings },
    ],
  },
];

// 단일 배열 (기존 코드와의 호환 유지)
const NAV = NAV_GROUPS.flatMap(g => g.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/admin-login");
        return;
      }
      // is_admin 확인
      const { data: member } = await supabase
        .from("members")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (!member?.is_admin) {
        await supabase.auth.signOut();
        router.replace("/admin-login");
        return;
      }
      setAdminEmail(session.user.email ?? "");
      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--gold)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)" }}>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40, backdropFilter: "blur(4px)" }} />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100%", zIndex: 50,
        width: collapsed ? "68px" : "240px",
        background: "var(--bg-surface)", borderRight: "1px solid var(--bg-border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
        className={!mobileOpen ? "max-md:-translate-x-full" : ""}
      >
        {/* 로고 */}
        <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16,7 22,7 22,13" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.2 }}>온종일 프로젝트</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>ADMIN</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: 32, height: 32, borderRadius: "10px", margin: "0 auto", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={16} color="var(--gold)" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="max-md:hidden" style={{ width: 26, height: 26, borderRadius: "7px", border: "1px solid var(--bg-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <ChevronLeft size={13} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        {/* 네비 */}
        <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? "4px" : 0 }}>
              {/* 그룹 레이블 */}
              {group.label && !collapsed && (
                <div style={{ padding: "8px 10px 4px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {group.label}
                </div>
              )}
              {group.label && collapsed && gi > 0 && (
                <div style={{ height: "1px", background: "var(--bg-border)", margin: "6px 8px" }} />
              )}
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const c = (item as any).color ?? group.color ?? "var(--gold)";
                const cRgb = c.startsWith("var") ? "201,168,76" :
                             c === "#6C47FF" ? "108,71,255" :
                             c === "#2563EB" ? "37,99,235" :
                             c === "#FF2D78" ? "255,45,120" :
                             c === "#E8599A" ? "232,89,154" :
                             c === "#059669" ? "5,150,105" : "201,168,76";
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: collapsed ? 0 : "10px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "10px 0" : "8px 10px",
                      borderRadius: "10px", marginBottom: "1px",
                      background: active ? `rgba(${cRgb},0.1)` : "transparent",
                      border: active ? `1px solid rgba(${cRgb},0.25)` : "1px solid transparent",
                      color: active ? c : "var(--text-secondary)",
                      textDecoration: "none", transition: "all 0.15s", position: "relative",
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = `rgba(${cRgb},0.05)`; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}}
                  >
                    {active && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "60%", borderRadius: "0 2px 2px 0", background: c }} />}
                    <item.icon size={16} style={{ flexShrink: 0, color: active ? c : "var(--text-muted)" }} />
                    {!collapsed && <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500, flex: 1 }}>{item.label}</span>}
                    {!collapsed && (item as any).highlight && !active && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0, animation: "glowPulse 2s infinite" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 하단 유저 */}
        <div style={{ padding: "10px", borderTop: "1px solid var(--bg-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : "8px", justifyContent: collapsed ? "center" : "flex-start", padding: "8px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--gold)" }}>관</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>관리자</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminEmail}</p>
                </div>
                <button
                  onClick={async () => {
                    const supabase = createBrowserSupabaseClient();
                    await supabase.auth.signOut();
                    window.location.href = "/admin-login";
                  }}
                  title="로그아웃"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, transition: "margin-left 0.3s" }}
        className={collapsed ? "md:ml-[68px]" : "md:ml-[240px]"}>
        <header style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)", flexShrink: 0, position: "sticky", top: 0, zIndex: 30 }}>
          <button className="md:hidden" onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <Menu size={22} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
            <button
              onClick={() => router.push("/portal")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--accent)", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(79,142,247,0.15)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(79,142,247,0.08)"; }}
            >
              <ExternalLink size={13} /> 회원 포털
            </button>
            <ThemeToggle />
            <button style={{ position: "relative", width: 34, height: 34, borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <Bell size={15} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", border: "2px solid var(--bg-surface)" }} />
            </button>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--gold)" }}>관</div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>

      {/* 수당 플랜 고정 FAB */}
      <button
        onClick={() => setShowPlan(true)}
        style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 60,
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 20px", borderRadius: "999px",
          background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 24px rgba(201,168,76,0.5), 0 0 0 1px rgba(201,168,76,0.3)",
          transition: "all 0.2s",
          color: "#1a1400", fontSize: "13px", fontWeight: 800,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,168,76,0.6), 0 0 0 1px rgba(201,168,76,0.4)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(201,168,76,0.5), 0 0 0 1px rgba(201,168,76,0.3)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" />
        </svg>
        수당 플랜 보기
      </button>

      {showPlan && <CommissionPlanModal onClose={() => setShowPlan(false)} />}
    </div>
  );
}
