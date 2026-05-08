"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, Wallet, ShoppingBag, User, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 h-14 bg-bg-surface/90 backdrop-blur border-b border-bg-border">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-gold" />
            </div>
            <span className="font-display font-bold text-sm text-text-primary">BangpanPRO</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                  active ? "bg-gold/10 text-gold" : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}>
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center">
              <span className="text-gold text-xs font-bold">김</span>
            </div>
            <button className="text-text-muted hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-bg-surface border-t border-bg-border">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center gap-1 py-2 text-[10px] transition-colors",
                active ? "text-gold" : "text-text-muted"
              )}>
                <item.icon style={{ width: "18px", height: "18px" }} />
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
