"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, GitBranch, Wallet,
  ShoppingBag, User, LogOut,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const NAV = [
  { label: "현황", href: "/portal", icon: LayoutDashboard },
  { label: "조직", href: "/network", icon: GitBranch },
  { label: "수당", href: "/earnings", icon: Wallet },
  { label: "쇼핑", href: "/shop", icon: ShoppingBag },
  { label: "내정보", href: "/profile", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* 상단 헤더 */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50, height: "52px",
        background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
        }}>
          {/* 로고 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "8px",
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16,7 22,7 22,13" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>BangpanPRO</span>
          </div>

          {/* PC 네비 */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: "2px" }}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 12px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: active ? 600 : 500, textDecoration: "none",
                  background: active ? "rgba(201,168,76,0.1)" : "transparent",
                  color: active ? "var(--gold)" : "var(--text-secondary)",
                  border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <item.icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle />
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "var(--gold)",
            }}>김</div>
            <button
              onClick={handleLogout}
              title="로그아웃"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: "4px",
                display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F87171"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 콘텐츠 — 풀스크린 */}
      <main style={{ width: "100%", padding: "16px 16px 80px" }} className="md:px-6 md:py-5 md:pb-6">
        {children}
      </main>

      {/* 모바일 하단 탭 */}
      <div className="md:hidden" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--bg-surface)", borderTop: "1px solid var(--bg-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                padding: "10px 0 8px",
                color: active ? "var(--gold)" : "var(--text-muted)",
                textDecoration: "none", fontSize: "10px",
                fontWeight: active ? 700 : 400,
                position: "relative", transition: "color 0.15s",
              }}>
                {active && <span style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "28px", height: "2px", borderRadius: "0 0 4px 4px",
                  background: "var(--gold)",
                }} />}
                <item.icon size={21} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
