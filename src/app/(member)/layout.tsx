"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, Wallet, ShoppingBag, User, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV = [
  { label: "내 현황", href: "/portal", icon: LayoutDashboard },
  { label: "내 조직", href: "/network", icon: GitBranch },
  { label: "수당 내역", href: "/earnings", icon: Wallet },
  { label: "쇼핑몰", href: "/shop", icon: ShoppingBag },
  { label: "내 정보", href: "/profile", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-50 h-14" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)" }}>
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>BangpanPRO</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    background: active ? "rgba(201,168,76,0.1)" : "transparent",
                    color: active ? "var(--gold)" : "var(--text-secondary)",
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>김</span>
            </div>
            <button style={{ color: "var(--text-muted)" }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--bg-border)" }}>
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1 py-2 text-[10px] transition-colors"
                style={{ color: active ? "var(--gold)" : "var(--text-muted)" }}
              >
                <item.icon style={{ width: 18, height: 18 }} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">{children}</main>
    </div>
  );
}
