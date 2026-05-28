"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, Calculator,
  Settings, TrendingUp, LogOut, GitBranch,
  Wallet, Package, Bell, Menu, X, ChevronLeft, ExternalLink,
  FlaskConical,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV = [
  { label: "대시보드",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "회원 관리",  href: "/members",      icon: Users },
  { label: "조직도",     href: "/org",          icon: GitBranch },
  { label: "매출 관리",  href: "/sales",        icon: TrendingUp },
  { label: "주문 관리",  href: "/orders",       icon: ShoppingBag },
  { label: "상품 관리",  href: "/products",     icon: Package },
  { label: "수당 플랜",  href: "/plan",         icon: Calculator, highlight: true },
  { label: "수당 시뮬레이션", href: "/simulation", icon: FlaskConical, highlight: true },
  { label: "정산 관리",  href: "/settlement",   icon: Wallet },
  { label: "시스템 설정",href: "/settings",     icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
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
                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.2 }}>BangpanPRO</p>
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
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const isSimulation = item.href === "/simulation";
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: collapsed ? 0 : "10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px 0" : "9px 10px",
                  borderRadius: "10px", marginBottom: "2px",
                  background: active
                    ? isSimulation ? "rgba(167,139,250,0.12)" : "rgba(201,168,76,0.1)"
                    : "transparent",
                  border: active
                    ? isSimulation ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(201,168,76,0.2)"
                    : "1px solid transparent",
                  color: active
                    ? isSimulation ? "#A78BFA" : "var(--gold)"
                    : "var(--text-secondary)",
                  textDecoration: "none", transition: "all 0.15s", position: "relative",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = isSimulation ? "rgba(167,139,250,0.06)" : "rgba(201,168,76,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}}
              >
                {active && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "60%", borderRadius: "0 2px 2px 0", background: isSimulation ? "#A78BFA" : "var(--gold)" }} />}
                <item.icon size={17} style={{ flexShrink: 0, color: active ? (isSimulation ? "#A78BFA" : "var(--gold)") : "var(--text-muted)" }} />
                {!collapsed && <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>{item.label}</span>}
                {!collapsed && item.highlight && !active && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: isSimulation ? "#A78BFA" : "var(--gold)", animation: "glowPulse 2s infinite" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단 유저 */}
        <div style={{ padding: "10px", borderTop: "1px solid var(--bg-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : "8px", justifyContent: collapsed ? "center" : "flex-start", padding: "8px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--gold)" }}>관</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>관리자</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>admin@company.com</p>
                </div>
                <button
                  onClick={async () => {
                    const { createBrowserSupabaseClient } = await import("@/lib/supabase");
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: collapsed ? "68px" : "240px", transition: "margin-left 0.3s" }} className="max-md:ml-0">
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
    </div>
  );
}
