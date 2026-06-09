"use client";

import { useState, useEffect } from "react";
import { fetchAdminDashboard } from "@/lib/fetchers";
import { formatKRW } from "@/lib/utils";
import { Skeleton, SkeletonStat, SkeletonCard, SkeletonStyle } from "@/components/ui/Skeleton";
import { TrendingUp, ShoppingBag, Users, CheckCircle, AlertCircle, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchAdminDashboard().then(d => { setData(d); setIsLoading(false); });
  }, []);

  const today = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric", weekday:"long" });

  if (isLoading) return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <SkeletonStyle />
      <Skeleton height={28} width="220px" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "12px" }}>
        {Array.from({length:4}).map((_,i)=><SkeletonStat key={i}/>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <SkeletonCard height={200} />
        <SkeletonCard height={200} />
      </div>
    </div>
  );

  const STATUS_MAP: Record<string,{label:string;color:string;bg:string}> = {
    PAID:      {label:"결제완료",color:"#93C5FD",bg:"rgba(79,142,247,0.12)"},
    SHIPPING:  {label:"배송중",  color:"#C4B5FD",bg:"rgba(167,139,250,0.12)"},
    DELIVERED: {label:"배송완료",color:"var(--emerald)",bg:"rgba(16,185,129,0.12)"},
    CANCELLED: {label:"취소",    color:"#F87171",bg:"rgba(239,68,68,0.12)"},
    PENDING:   {label:"결제대기",color:"var(--gold)",bg:"rgba(201,168,76,0.12)"},
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>대시보드</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{today}</p>
        </div>
        {data?.todayClosing ? (
          <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"999px", background:"rgba(0,200,150,0.1)", border:"1px solid rgba(0,200,150,0.25)" }}>
            <CheckCircle size={13} color="#00C896"/>
            <span style={{ fontSize:"12px", fontWeight:600, color:"#00C896" }}>오늘 마감 완료</span>
          </div>
        ) : (
          <Link href="/closing" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"999px", background:"rgba(255,149,0,0.1)", border:"1px solid rgba(255,149,0,0.3)", textDecoration:"none" }}>
            <AlertCircle size={13} color="#FF9500"/>
            <span style={{ fontSize:"12px", fontWeight:600, color:"#FF9500" }}>오늘 마감 필요</span>
          </Link>
        )}
      </div>

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "12px" }}>
        {[
          { label: "이번달 매출",  value: formatKRW(data?.monthRevenue??0),     color: "#C9A84C", icon: TrendingUp },   // gold — 돈
          { label: "오늘 매출",    value: formatKRW(data?.todayRevenue??0),      color: "#2563EB", icon: ShoppingBag },   // blue — 운영
          { label: "전체 회원",    value: `${(data?.totalMembers??0).toLocaleString()}명`, color: "#6C47FF", icon: Users },   // violet — 사람
          { label: "오늘 마감",    value: data?.todayClosing ? "완료" : "미완료", color: data?.todayClosing ? "#059669" : "#FF2D78", icon: CheckCircle },  // emerald 완료 / pink 미완료
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px", position: "relative", overflow: "hidden" }}>
            <svg style={{ position:"absolute", right:-8, top:-8, opacity:0.06 }} width="80" height="80" viewBox="0 0 80 80"><circle cx="60" cy="20" r="40" fill={s.color}/></svg>
            <div style={{ width:34, height:34, borderRadius:"10px", background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"10px" }}>
              <s.icon size={17} color={s.color}/>
            </div>
            <p style={{ fontSize:"11px", color:"var(--text-muted)", marginBottom:"3px" }}>{s.label}</p>
            <p style={{ fontFamily:"Syne,sans-serif", fontSize:"20px", fontWeight:800, color:s.color, margin:0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 바로가기 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "10px" }}>
        {[
          {label:"회원 관리",   href:"/members",    color:"#6C47FF"},  // violet — 사람
          {label:"주문 관리",   href:"/orders",     color:"#2563EB"},  // blue — 운영
          {label:"수당 플랜",   href:"/plan",       color:"#C9A84C"},  // gold — 돈
          {label:"마감·정산",  href:"/closing",    color:"#FF2D78"},  // pink — 긴급
          {label:"지급 캘린더",href:"/calendar",   color:"#FF2D78"},  // pink — 긴급
          {label:"정산 관리",   href:"/settlement", color:"#C9A84C"},  // gold — 돈
        ].map(q => (
          <Link key={q.href} href={q.href} style={{
            padding:"14px", borderRadius:"14px", textAlign:"center", textDecoration:"none",
            background:`${q.color}10`, border:`1px solid ${q.color}30`,
            color:q.color, fontSize:"13px", fontWeight:700, transition:"all 0.15s",
            display:"block",
          }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${q.color}20`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`${q.color}10`;(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}
          >{q.label}</Link>
        ))}
      </div>

      {/* 최근 주문 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--bg-border)" }}>
          <h3 style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", margin:0 }}>최근 주문</h3>
          <Link href="/orders" style={{ fontSize:"12px", color:"var(--gold)", textDecoration:"none" }}>전체 보기 →</Link>
        </div>
        {(data?.recentOrders??[]).length === 0 ? (
          <div style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontSize:"13px" }}>주문이 없습니다</div>
        ) : (data?.recentOrders??[]).map((o:any,i:number)=>{
          const S = STATUS_MAP[o.status]??STATUS_MAP["PENDING"];
          return (
            <div key={o.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", borderBottom: i<4 ? "1px solid var(--bg-border)" : "none" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text-primary)", margin:0 }}>{(o.member as any)?.name??"—"}</p>
                <p style={{ fontSize:"11px", color:"var(--text-muted)", margin:0, fontFamily:"monospace" }}>{o.order_code}</p>
              </div>
              <span style={{ fontSize:"13px", fontWeight:700, color:"var(--gold)" }}>{formatKRW(o.total_price)}</span>
              <span style={{ padding:"2px 8px", borderRadius:"999px", fontSize:"10px", fontWeight:600, background:S.bg, color:S.color, whiteSpace:"nowrap" }}>{S.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
