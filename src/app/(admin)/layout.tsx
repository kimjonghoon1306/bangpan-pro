"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, Calculator,
  Settings, TrendingUp, LogOut, ChevronLeft, GitBranch,
  Wallet, Package, Bell, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed md:relative z-50 h-full flex flex-col transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )} style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--bg-border)" }}>

        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--bg-border)" }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "var(--gold)" }} />
              </div>
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>BangpanPRO</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "var(--gold)" }} />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex w-6 h-6 items-center justify-center transition-colors" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group", collapsed && "justify-center")}
                    style={{
                      background: active ? "rgba(201,168,76,0.1)" : "transparent",
                      border: active ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                      color: active ? "var(--gold)" : "var(--text-secondary)",
                    }}
                  >
                    <item.icon style={{ width: 18, height: 18, flexShrink: 0, color: active ? "var(--gold)" : "var(--text-muted)" }} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {!collapsed && item.highlight && !active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full animate-glow-pulse" style={{ background: "var(--gold)" }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
          <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>관</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>관리자</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>admin@company.com</p>
                </div>
                <button className="transition-colors" style={{ color: "var(--text-muted)" }}>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 flex-shrink-0" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)" }}>
          <button className="md:hidden transition-colors" style={{ color: "var(--text-muted)" }} onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <button className="relative w-8 h-8 flex items-center justify-center transition-colors" style={{ color: "var(--text-muted)" }}>
              <Bell style={{ width: 18, height: 18 }} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>관</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
