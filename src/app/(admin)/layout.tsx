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
    <div className="flex h-screen bg-bg overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed md:relative z-50 h-full flex flex-col bg-bg-surface border-r border-bg-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-bg-border flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gold" />
              </div>
              <span className="font-display font-bold text-text-primary tracking-tight">BangpanPRO</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex w-6 h-6 items-center justify-center text-text-muted hover:text-text-secondary transition-colors">
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                      active ? "bg-gold/10 text-gold border border-gold/15" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon style={{ width: "18px", height: "18px" }} className={cn("flex-shrink-0", active ? "text-gold" : "text-text-muted group-hover:text-text-secondary")} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {!collapsed && item.highlight && !active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-glow-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-bg-border p-3">
          <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
              <span className="text-gold text-xs font-bold">관</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">관리자</p>
                  <p className="text-xs text-text-muted truncate">admin@company.com</p>
                </div>
                <button className="text-text-muted hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-bg-border bg-bg-surface flex-shrink-0">
          <button className="md:hidden text-text-muted hover:text-text-primary transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
              <Bell style={{ width: "18px", height: "18px" }} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center">
              <span className="text-gold text-xs font-bold">관</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
