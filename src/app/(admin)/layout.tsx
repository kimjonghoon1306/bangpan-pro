"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, Calculator,
  Settings, TrendingUp, LogOut, GitBranch,
  Wallet, Package, Bell, Menu, X, ChevronLeft,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "회원 관리", href: "/members", icon: Users },
  { label: "조직도", href: "/org", icon: GitBranch },
  { label: "주문 관리", href: "/orders", icon: ShoppingBag },
  { label: "상품 관리", href: "/products", icon: Package },
  { label: "수당 플랜", href: "/plan", icon: Calculator, highlight: true },
  { label: "정산 관리", href: "/settlement", icon: Wallet },
  { label: "시스템 설정", href: "/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 40, backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* 사이드바 */}
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100%", zIndex: 50,
        width: collapsed ? "68px" : "240px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: mobileOpen ? "translateX(0)" : undefined,
      }}
        className={!mobileOpen ? "max-md:-translate-x-full" : ""}
      >
        {/* 로고 */}
        <div style={{
          height: "64px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          borderBottom: "1px solid var(--bg-border)", flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* SVG 로고 아이콘 */}
              <div style={{
                width: 34, height: 34, borderRadius: "10px",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16,7 22,7 22,13" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.2 }}>BangpanPRO</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>ADMIN</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 34, height: 34, borderRadius: "10px", margin: "0 auto",
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16,7 22,7 22,13" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="max-md:hidden"
            style={{
              width: 28, height: 28, borderRadius: "8px", border: "1px solid var(--bg-border)",
              background: "transparent", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
            style={{
              width: 28, height: 28, borderRadius: "8px", border: "none",
              background: "transparent", cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 네비 */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : "12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "12px 0" : "10px 12px",
                  borderRadius: "10px", marginBottom: "2px",
                  background: active ? "rgba(201,168,76,0.1)" : "transparent",
                  border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                  color: active ? "var(--gold)" : "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  position: "relative",
                  animationDelay: `${i * 40}ms`,
                }}
                className="animate-slide-in"
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0, color: active ? "var(--gold)" : "var(--text-muted)" }} />
                {!collapsed && (
                  <span style={{ fontSize: "14px", fontWeight: active ? 600 : 500, flex: 1 }}>{item.label}</span>
                )}
                {!collapsed && item.highlight && !active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--gold)", animation: "glowPulse 2s infinite",
                  }} />
                )}
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: "3px", height: "60%", borderRadius: "0 2px 2px 0",
                    background: "var(--gold)",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 유저 */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--bg-border)" }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "10px",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "8px",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "var(--gold)",
            }}>관</div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>관리자</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>admin@company.com</p>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
        marginLeft: "240px", transition: "margin-left 0.3s",
      }}
        className={`${collapsed ? "md:ml-[68px]" : "md:ml-[240px]"} ml-0`}
      >
        {/* 헤더 */}
        <header style={{
          height: "60px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px",
          background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)",
          flexShrink: 0, position: "sticky", top: 0, zIndex: 30,
        }}>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: "4px",
            }}
          >
            <Menu size={22} />
          </button>

          {/* 페이지 타이틀 */}
          <div className="hidden md:block">
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {NAV.find(n => pathname.startsWith(n.href))?.label ?? "BangpanPRO"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <ThemeToggle size="sm" />
            <button style={{
              position: "relative", width: 36, height: 36,
              borderRadius: "10px", background: "var(--bg-elevated)",
              border: "1px solid var(--bg-border)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)",
            }}>
              <Bell size={16} />
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--gold)", border: "2px solid var(--bg-surface)",
              }} />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "var(--gold)",
            }}>관</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
