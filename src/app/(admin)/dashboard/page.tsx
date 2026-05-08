"use client";

import {
  Users,
  TrendingUp,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserPlus,
  Calculator,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATS = [
  { label: "전체 회원", value: "12,847", change: "+128", up: true, icon: Users, color: "text-gold", glow: "bg-gold/10 border-gold/20" },
  { label: "이번달 매출", value: "₩482,300,000", change: "+12.4%", up: true, icon: TrendingUp, color: "text-emerald-soft", glow: "bg-emerald-soft/10 border-emerald-soft/20" },
  { label: "이번달 주문", value: "3,241", change: "+8.2%", up: true, icon: ShoppingBag, color: "text-accent", glow: "bg-accent/10 border-accent/20" },
  { label: "지급 예정 수당", value: "₩38,420,000", change: "-2.1%", up: false, icon: Wallet, color: "text-gold", glow: "bg-gold/10 border-gold/20" },
];

const REVENUE_DATA = [
  { month: "1월", revenue: 320 },
  { month: "2월", revenue: 280 },
  { month: "3월", revenue: 390 },
  { month: "4월", revenue: 420 },
  { month: "5월", revenue: 380 },
  { month: "6월", revenue: 450 },
  { month: "7월", revenue: 482 },
];

const RECENT_MEMBERS = [
  { name: "김민수", code: "M-012847", rank: "골드", joined: "2024.07.01", sponsor: "이영희" },
  { name: "박지현", code: "M-012846", rank: "실버", joined: "2024.07.01", sponsor: "최강산" },
  { name: "이준호", code: "M-012845", rank: "일반", joined: "2024.06.30", sponsor: "김민수" },
  { name: "정수아", code: "M-012844", rank: "일반", joined: "2024.06.30", sponsor: "박지현" },
  { name: "한상욱", code: "M-012843", rank: "실버", joined: "2024.06.29", sponsor: "이준호" },
];

const RANK_COLORS: Record<string, string> = {
  골드: "badge-gold",
  실버: "text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5 text-[10px]",
  일반: "badge-gray",
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-bg-border rounded-lg p-3 text-xs">
        <p className="text-text-muted mb-1">{label}</p>
        <p className="text-gold font-medium">매출 {payload[0]?.value}백만원</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">대시보드</h1>
          <p className="text-text-muted text-sm mt-0.5">2024년 7월 — 실시간 현황</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-soft">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-soft animate-pulse" />
          실시간 동기화
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="card-elevated relative overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.glow}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-soft" : "text-red-400"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-text-muted text-xs mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-text-primary font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-elevated animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-text-primary">월별 매출 추이</h3>
              <p className="text-text-muted text-xs mt-0.5">단위: 백만원</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#444466", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#444466", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-text-primary">최근 가입</h3>
            <UserPlus className="w-4 h-4 text-text-muted" />
          </div>
          <ul className="space-y-3">
            {RECENT_MEMBERS.map((m) => (
              <li key={m.code} className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-text-secondary">{m.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{m.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${RANK_COLORS[m.rank]}`}>{m.rank}</span>
                  </div>
                  <p className="text-[11px] text-text-muted">{m.code} · 추천: {m.sponsor}</p>
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">{m.joined}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "회원 등록", icon: UserPlus, href: "/members/new" },
          { label: "수당 계산", icon: Calculator, href: "/commission" },
          { label: "주문 관리", icon: ShoppingBag, href: "/orders" },
          { label: "플랜 설정", icon: Activity, href: "/plan" },
        ].map((action) => (
          <button key={action.label} className="flex items-center gap-3 px-4 py-3 bg-bg-elevated border border-bg-border rounded-xl hover:border-gold/25 hover:bg-gold/5 transition-all group">
            <action.icon className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors" />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
