"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import {
  CheckCircle, Clock, TrendingUp, Users, Wallet,
  Award, AlertTriangle, ChevronDown, ChevronRight,
  Calendar, Download, Play, RefreshCw, Star
} from "lucide-react";

// ─── 기본 수당률 (DB 없어도 동작) ─────────────────────
const DEFAULT_RATES: Record<number,{sales:number,ref:number,over:number}> = {
  1:{sales:25,ref:5,over:0},
  2:{sales:28,ref:7,over:3},
  3:{sales:32,ref:10,over:8},
};

// ─── 색상 ────────────────────────────────────────────
const STEP_COLORS = ["#6C47FF","#00C896","#FF9500","#E8599A","#4FA3E8"];

function StepHeader({ step, title, desc, color, done, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      width:"100%", display:"flex", alignItems:"center", gap:"16px",
      padding:"20px 24px", background:"none", border:"none", cursor:"pointer",
      textAlign:"left", transition:"background 0.15s",
      borderBottom: active ? `2px solid ${color}` : "1px solid var(--bg-border)",
    }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(0,0,0,0.02)"}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="none"}
    >
      <div style={{
        width:40,height:40,borderRadius:"50%",flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",
        background: done ? color : active ? `${color}20` : "var(--bg-border)",
        border: `2px solid ${done||active ? color : "transparent"}`,
        transition:"all 0.2s",
      }}>
        {done
          ? <CheckCircle size={18} color="#fff" />
          : <span style={{fontSize:"16px",fontWeight:800,color: active ? color : "var(--text-muted)"}}>{step}</span>
        }
      </div>
      <div style={{flex:1}}>
        <p style={{fontSize:"15px",fontWeight:700,color: active||done ? "var(--text-primary)" : "var(--text-muted)",margin:0}}>{title}</p>
        <p style={{fontSize:"12px",color:"var(--text-muted)",margin:0,marginTop:"2px"}}>{desc}</p>
      </div>
      {active ? <ChevronDown size={18} color="var(--text-muted)"/> : <ChevronRight size={18} color="var(--text-muted)"/>}
    </button>
  );
}

export default function ClosingPage() {
  const [activeStep, setActiveStep] = useState<"daily"|"weekly"|"monthly"|"history">("daily");

  // ── 일일 마감 ──────────────────────────────────────
  const [todayClosing, setTodayClosing] = useState<any>(null);
  const [closingRunning, setClosingRunning] = useState(false);
  const [closingResult, setClosingResult] = useState<any>(null);
  const [closingHistory, setClosingHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── 주간 정산 ──────────────────────────────────────
  const [weeklyPeriod, setWeeklyPeriod] = useState<{start:string,end:string,payment:string}|null>(null);
  const [weeklyMembers, setWeeklyMembers] = useState<any[]>([]);
  const [weeklySearch, setWeeklySearch] = useState("");
  const [weeklyCalc, setWeeklyCalc] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState<any[]>([]);
  const [weeklyDone, setWeeklyDone] = useState(false);

  // ── 월간 공유수당 ──────────────────────────────────
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [discretionList, setDiscretionList] = useState<{memberId:string,name:string,amount:number,reason:string}[]>([]);
  const [monthlyCalc, setMonthlyCalc] = useState(false);
  const [monthlyDone, setMonthlyDone] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);

  // 오늘 마감 여부 + 이력 로드
  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const today = new Date().toISOString().split("T")[0];
      const { data: closing } = await supabase.from("daily_closings").select("*").eq("closing_date", today).single();
      setTodayClosing(closing);

      // 전체 회원 로드 (공유수당 대상자 검색용)
      const { data: members } = await supabase.from("members")
        .select("id, name, member_code, phone, email, rank:ranks(name,level,color)")
        .eq("is_admin", false).order("name");
      setAllMembers((members as any) ?? []);

      // 주간 정산 기간 계산 (2주 전 주)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - dayOfWeek + 1);
      const twoWeeksAgo = new Date(thisMonday); twoWeeksAgo.setDate(thisMonday.getDate() - 14);
      const twoWeeksAgoEnd = new Date(twoWeeksAgo); twoWeeksAgoEnd.setDate(twoWeeksAgo.getDate() + 6);
      const nextFriday = new Date(now); nextFriday.setDate(now.getDate() + (5 - dayOfWeek + 7) % 7);
      setWeeklyPeriod({
        start: twoWeeksAgo.toISOString().split("T")[0],
        end: twoWeeksAgoEnd.toISOString().split("T")[0],
        payment: nextFriday.toISOString().split("T")[0],
      });

      // 이번달 공유수당 데이터
      const { data: monthly } = await supabase.from("monthly_shared_payouts")
        .select("*").eq("year", now.getFullYear()).eq("month", now.getMonth()+1).single();
      if (monthly) setMonthlyData(monthly);
    }
    load();
  }, []);

  // ── 일일 마감 실행 ─────────────────────────────────
  async function runDailyClosing() {
    if (closingRunning) return;
    setClosingRunning(true);
    const supabase = createBrowserSupabaseClient();
    const today = new Date().toISOString().split("T")[0];

    // 오늘 주문 집계
    const { data: orders } = await supabase.from("orders")
      .select("id, member_id, total_price, total_bv, total_pv, status")
      .gte("created_at", today + "T00:00:00").lt("created_at", today + "T23:59:59")
      .neq("status", "CANCELLED");

    const totalRevenue = orders?.reduce((s:number,o:any)=>s+o.total_price,0) ?? 0;
    const totalBv = orders?.reduce((s:number,o:any)=>s+o.total_bv,0) ?? 0;

    // 수당 규칙 로드
    const { data: rules } = await supabase.from("commission_rules")
      .select("*, tiers:commission_tiers(rank_level,rate)").eq("is_active", true);
    const rList = (rules as any[]) ?? [];

    // 모든 회원 직급 로드
    const { data: allMemberRanks } = await supabase.from("members")
      .select("id, sponsor_id, rank_id, personal_pv, group_gv, cumulative_commission, rank:ranks(id,level,name)")
      .eq("is_admin", false);

    const memberMap: Record<string,any> = {};
    (allMemberRanks ?? []).forEach((m:any) => { memberMap[m.id] = m; });

    let totalCommission = 0;
    let rankChanges = 0;
    const memberCommMap: Record<string,number> = {};
    const memberGvAdd: Record<string,number> = {};

    // 회원별 수당 계산
    for (const order of orders ?? []) {
      const member = memberMap[order.member_id];
      if (!member) continue;
      const level = member.rank?.level ?? 1;

      // GV 누적
      memberGvAdd[order.member_id] = (memberGvAdd[order.member_id] ?? 0) + order.total_bv;

      // ① 판매 수당
      const sRule = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===0&&!r.is_volume_only);
      const sRate = sRule?.tiers?.find((t:any)=>t.rank_level===level)?.rate ?? DEFAULT_RATES[level]?.sales ?? 25;
      const sComm = Math.floor(order.total_bv * sRate / 100);
      memberCommMap[order.member_id] = (memberCommMap[order.member_id]??0) + sComm;
      totalCommission += sComm;

      // ② 추천 수당 (직접 추천인에게)
      const sponsorId = member.sponsor_id;
      if (sponsorId && memberMap[sponsorId]) {
        const sLevel = memberMap[sponsorId]?.rank?.level ?? 1;
        memberGvAdd[sponsorId] = (memberGvAdd[sponsorId]??0) + order.total_bv;
        const rRule = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===1&&!r.is_volume_only);
        const rRate = rRule?.tiers?.find((t:any)=>t.rank_level===sLevel)?.rate ?? DEFAULT_RATES[sLevel]?.ref ?? 5;
        const rComm = Math.floor(order.total_bv * rRate / 100);
        memberCommMap[sponsorId] = (memberCommMap[sponsorId]??0) + rComm;
        totalCommission += rComm;

        // ③ 오버라이딩 (추천인의 추천인이 매니저 이상)
        const grandId = memberMap[sponsorId]?.sponsor_id;
        if (grandId && memberMap[grandId]) {
          const gLevel = memberMap[grandId]?.rank?.level ?? 1;
          if (gLevel >= 2) {
            memberGvAdd[grandId] = (memberGvAdd[grandId]??0) + order.total_bv;
            const oRule = rList.find((r:any)=>r.rule_type==="TEAM"&&!r.is_volume_only);
            const oRate = oRule?.tiers?.find((t:any)=>t.rank_level===gLevel)?.rate ?? DEFAULT_RATES[gLevel]?.over ?? 0;
            const oComm = Math.floor(order.total_bv * oRate / 100);
            memberCommMap[grandId] = (memberCommMap[grandId]??0) + oComm;
            totalCommission += oComm;
          }
        }
      }
    }

    // 회원별 GV 업데이트 + 승급 체크
    const { data: ranks } = await supabase.from("ranks").select("*").order("level");
    const snapshots: any[] = [];

    for (const [memberId, addGv] of Object.entries(memberGvAdd)) {
      const member = memberMap[memberId];
      if (!member) continue;
      const newGv = (member.group_gv ?? 0) + addGv;
      const newComm = (member.cumulative_commission ?? 0) + (memberCommMap[memberId] ?? 0);

      // 승급 조건 체크
      const directCount = (allMemberRanks ?? []).filter((m:any)=>m.sponsor_id===memberId).length;
      const eligibleRank = [...(ranks??[])].reverse().find((r:any)=>
        directCount >= (r.min_direct_referral ?? 0) && newGv >= (r.min_gv ?? 0)
      );
      const newRankId = eligibleRank?.id ?? member.rank_id;
      const rankChanged = newRankId !== member.rank_id;
      if (rankChanged) rankChanges++;

      // members 업데이트
      await supabase.from("members").update({
        group_gv: newGv,
        rank_id: newRankId,
        cumulative_commission: newComm,
        last_closing_date: today,
      }).eq("id", memberId);

      snapshots.push({
        closing_date: today,
        member_id: memberId,
        rank_id: newRankId,
        personal_pv: member.personal_pv ?? 0,
        group_gv: newGv,
        today_sales: memberGvAdd[memberId] ?? 0,
        today_commission: memberCommMap[memberId] ?? 0,
        cumulative_commission: newComm,
        rank_changed: rankChanged,
        prev_rank_id: rankChanged ? member.rank_id : null,
      });
    }

    // 마감 이력 저장
    const { data: closing } = await supabase.from("daily_closings").insert({
      closing_date: today,
      total_orders: orders?.length ?? 0,
      total_revenue: totalRevenue,
      total_bv: totalBv,
      total_commission: totalCommission,
      rank_changes: rankChanges,
      status: "COMPLETED",
    }).select("id").single();

    if (closing?.id && snapshots.length > 0) {
      const withId = snapshots.map(s => ({ ...s, closing_id: closing.id }));
      await supabase.from("daily_member_snapshots").insert(withId);
    }

    setClosingResult({ orders: orders?.length??0, revenue: totalRevenue, commission: totalCommission, rankChanges });
    setTodayClosing({ closing_date: today, status: "COMPLETED", total_orders: orders?.length??0, total_revenue: totalRevenue, total_commission: totalCommission, rank_changes: rankChanges });
    setClosingRunning(false);
  }

  // ── 주간 정산 계산 ────────────────────────────────
  async function calcWeekly() {
    if (!weeklyPeriod) return;
    setWeeklyCalc(true);
    const supabase = createBrowserSupabaseClient();

    const { data: orders } = await supabase.from("orders")
      .select("id, member_id, total_bv, total_price")
      .eq("status", "PAID")
      .gte("paid_at", weeklyPeriod.start + "T00:00:00")
      .lte("paid_at", weeklyPeriod.end + "T23:59:59");

    const { data: rules } = await supabase.from("commission_rules")
      .select("*, tiers:commission_tiers(rank_level,rate)").eq("is_active",true);
    const rList = (rules as any[]) ?? [];

    const { data: members } = await supabase.from("members")
      .select("id, name, member_code, phone, email, sponsor_id, rank:ranks(level,name,color), bank_name, bank_account, bank_holder")
      .eq("is_admin", false);
    const mMap: Record<string,any> = {};
    (members??[]).forEach((m:any)=>{ mMap[m.id]=m; });

    const memberCalc: Record<string,{name:string,code:string,rank:any,sales:number,ref:number,over:number}> = {};
    for (const order of orders??[]) {
      const m = mMap[order.member_id]; if(!m) continue;
      const level = m.rank?.level??1;
      if (!memberCalc[order.member_id]) memberCalc[order.member_id]={name:m.name,code:m.member_code,rank:m.rank,sales:0,ref:0,over:0};

      const sRate = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===0&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===level)?.rate??DEFAULT_RATES[level]?.sales??25;
      memberCalc[order.member_id].sales += Math.floor(order.total_bv*sRate/100);

      const sid = m.sponsor_id;
      if (sid && mMap[sid]) {
        const sl = mMap[sid].rank?.level??1;
        if (!memberCalc[sid]) memberCalc[sid]={name:mMap[sid].name,code:mMap[sid].member_code,rank:mMap[sid].rank,sales:0,ref:0,over:0};
        const rRate = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===1&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===sl)?.rate??DEFAULT_RATES[sl]?.ref??5;
        memberCalc[sid].ref += Math.floor(order.total_bv*rRate/100);

        const gid = mMap[sid]?.sponsor_id;
        if (gid && mMap[gid]) {
          const gl = mMap[gid].rank?.level??1;
          if (gl>=2) {
            if (!memberCalc[gid]) memberCalc[gid]={name:mMap[gid].name,code:mMap[gid].member_code,rank:mMap[gid].rank,sales:0,ref:0,over:0};
            const oRate = rList.find((r:any)=>r.rule_type==="TEAM"&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===gl)?.rate??DEFAULT_RATES[gl]?.over??0;
            memberCalc[gid].over += Math.floor(order.total_bv*oRate/100);
          }
        }
      }
    }

    const result = Object.entries(memberCalc).map(([id,v])=>{
      const gross = v.sales+v.ref+v.over;
      const tax = Math.floor(gross*0.033);
      const m = mMap[id];
      return { id, ...v, gross, tax, net:gross-tax, bank:m?.bank_name, account:m?.bank_account, holder:m?.bank_holder };
    }).filter(r=>r.gross>0).sort((a,b)=>b.gross-a.gross);

    setWeeklyResult(result);
    setWeeklyCalc(false);
  }

  async function confirmWeekly() {
    if (!weeklyPeriod || weeklyResult.length===0) return;
    const supabase = createBrowserSupabaseClient();
    const { data: ws } = await supabase.from("weekly_settlements").insert({
      week_start: weeklyPeriod.start, week_end: weeklyPeriod.end, payment_date: weeklyPeriod.payment,
      total_revenue: weeklyResult.reduce((s,r)=>s+r.gross,0),
      total_commission: weeklyResult.reduce((s,r)=>s+r.gross,0),
      status: "PAID", paid_at: new Date().toISOString(),
    }).select("id").single();

    if (ws?.id) {
      await supabase.from("weekly_payouts").insert(weeklyResult.map(r=>({
        settlement_id: ws.id, member_id: r.id,
        sales_commission: r.sales, ref_commission: r.ref, over_commission: r.over,
        gross_amount: r.gross, tax_amount: r.tax, net_amount: r.net,
        bank_name: r.bank, bank_account: r.account, bank_holder: r.holder,
        status: "COMPLETED", paid_at: new Date().toISOString(),
      })));
    }
    setWeeklyDone(true);
  }

  // ── 월간 공유수당 계산 ────────────────────────────
  async function calcMonthly() {
    setMonthlyCalc(true);
    const supabase = createBrowserSupabaseClient();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth()+1, 1).toISOString();

    const { data: orders } = await supabase.from("orders").select("total_price").eq("status","PAID").gte("paid_at",monthStart).lt("paid_at",monthEnd);
    const totalRev = orders?.reduce((s:number,o:any)=>s+o.total_price,0)??0;

    const { count: mgrCount } = await supabase.from("members").select("*",{count:"exact",head:true}).eq("is_admin",false).eq("rank_id",(await supabase.from("ranks").select("id").eq("level",2).single()).data?.id);
    const { count: dirCount } = await supabase.from("members").select("*",{count:"exact",head:true}).eq("is_admin",false).eq("rank_id",(await supabase.from("ranks").select("id").eq("level",3).single()).data?.id);

    const mPool = Math.floor(totalRev*0.02);
    const dPool = Math.floor(totalRev*0.02);
    const aPool = Math.floor(totalRev*0.01);
    const perMgr = mgrCount && mgrCount>0 ? Math.floor(mPool/mgrCount) : 0;
    const perDir = dirCount && dirCount>0 ? Math.floor(dPool/dirCount) : 0;

    setMonthlyData({ year:now.getFullYear(), month:now.getMonth()+1, total_monthly_revenue:totalRev, manager_pool:mPool, director_pool:dPool, admin_discretion:aPool, manager_count:mgrCount??0, director_count:dirCount??0, per_manager:perMgr, per_director:perDir });
    setMonthlyCalc(false);
  }

  async function confirmMonthly() {
    if (!monthlyData) return;
    const supabase = createBrowserSupabaseClient();
    const { data: ms } = await supabase.from("monthly_shared_payouts").upsert({
      year: monthlyData.year, month: monthlyData.month,
      total_monthly_revenue: monthlyData.total_monthly_revenue,
      manager_pool: monthlyData.manager_pool, director_pool: monthlyData.director_pool,
      admin_discretion: monthlyData.admin_discretion,
      manager_count: monthlyData.manager_count, director_count: monthlyData.director_count,
      per_manager: monthlyData.per_manager, per_director: monthlyData.per_director,
      status: "PAID", paid_at: new Date().toISOString(),
    }, { onConflict: "year,month" }).select("id").single();

    if (ms?.id && discretionList.length>0) {
      await supabase.from("admin_discretion_payouts").insert(discretionList.map(d=>({ monthly_id:ms.id, member_id:d.memberId, amount:d.amount, reason:d.reason })));
    }
    setMonthlyDone(true);
  }

  const todayStr = new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});
  const alreadyClosed = !!todayClosing;

  return (
    <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>

      {/* ── 헤더 ── */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <h1 style={{fontFamily:"Syne,sans-serif",fontSize:"24px",fontWeight:800,color:"var(--text-primary)",margin:0}}>마감 · 정산</h1>
          <p style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"4px"}}>{todayStr} · 일일 마감 및 주간/월간 정산 처리</p>
        </div>
        {alreadyClosed && (
          <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"999px",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.25)"}}>
            <CheckCircle size={14} color="#00C896"/>
            <span style={{fontSize:"12px",fontWeight:600,color:"#00C896"}}>오늘 마감 완료</span>
          </div>
        )}
      </div>

      {/* ── STEP 1: 일일 마감 ── */}
      <div style={{background:"var(--bg-elevated)",border:`1.5px solid ${activeStep==="daily" ? STEP_COLORS[0] : "var(--bg-border)"}`,borderRadius:"18px",overflow:"hidden",transition:"border-color 0.2s"}}>
        <StepHeader step={1} title="일일 마감" desc="오늘 모든 주문 집계 · 수당 누적 · 직급 자동 변경" color={STEP_COLORS[0]} done={alreadyClosed} active={activeStep==="daily"} onClick={()=>setActiveStep(activeStep==="daily"?"history":"daily")} />
        {activeStep==="daily" && (
          <div style={{padding:"20px 24px",borderTop:`1px solid ${STEP_COLORS[0]}22`}}>
            {alreadyClosed ? (
              <div style={{background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:"14px",padding:"20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
                  <CheckCircle size={18} color="#00C896"/>
                  <span style={{fontSize:"14px",fontWeight:700,color:"#00C896"}}>오늘 마감 완료</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px"}}>
                  {[
                    {label:"주문 수",     value:`${todayClosing.total_orders}건`,     color:"#6C47FF"},
                    {label:"총 매출",     value:formatKRW(todayClosing.total_revenue), color:"#00C896"},
                    {label:"발생 수당",   value:formatKRW(todayClosing.total_commission),color:"#FF9500"},
                    {label:"직급 변경",  value:`${todayClosing.rank_changes}명`,       color:"#E8599A"},
                  ].map(s=>(
                    <div key={s.label} style={{background:"var(--bg)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                      <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"4px"}}>{s.label}</p>
                      <p style={{fontFamily:"Syne,sans-serif",fontSize:"20px",fontWeight:800,color:s.color}}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                <div style={{padding:"18px",borderRadius:"14px",background:"rgba(108,71,255,0.06)",border:"1px solid rgba(108,71,255,0.2)"}}>
                  <p style={{fontSize:"13px",color:"var(--text-secondary)",margin:0,lineHeight:1.6}}>
                    마감하기를 누르면 오늘 모든 주문이 집계되고, 회원별 수당이 누적됩니다.<br/>
                    승급 조건을 충족한 회원은 직급이 자동으로 변경됩니다.<br/>
                    마감 완료 후 회원들이 본인 현황을 실시간으로 확인할 수 있습니다.
                  </p>
                </div>
                <button onClick={runDailyClosing} disabled={closingRunning} style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",
                  padding:"16px",borderRadius:"14px",
                  background: closingRunning ? "var(--bg-border)" : `linear-gradient(135deg, ${STEP_COLORS[0]}, #9B7AFF)`,
                  border:"none",color:"#fff",fontSize:"16px",fontWeight:800,cursor:closingRunning?"not-allowed":"pointer",
                  transition:"all 0.2s",boxShadow: closingRunning ? "none" : `0 4px 20px ${STEP_COLORS[0]}44`,
                }}>
                  {closingRunning
                    ? <><RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/> 마감 처리 중...</>
                    : <><Play size={18}/> 오늘 마감하기</>
                  }
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </button>
                {closingResult && (
                  <div style={{padding:"14px",borderRadius:"12px",background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.2)",display:"flex",alignItems:"center",gap:"10px"}}>
                    <CheckCircle size={16} color="#00C896"/>
                    <span style={{fontSize:"13px",color:"#00C896",fontWeight:600}}>
                      마감 완료 — 주문 {closingResult.orders}건 · 매출 {formatKRW(closingResult.revenue)} · 수당 {formatKRW(closingResult.commission)} · 직급변경 {closingResult.rankChanges}명
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 2: 주간 정산 ── */}
      <div style={{background:"var(--bg-elevated)",border:`1.5px solid ${activeStep==="weekly" ? STEP_COLORS[1] : "var(--bg-border)"}`,borderRadius:"18px",overflow:"hidden",transition:"border-color 0.2s"}}>
        <StepHeader step={2} title="주간 정산" desc={weeklyPeriod ? `${weeklyPeriod.start} ~ ${weeklyPeriod.end} 매출 기준 · 지급일 ${weeklyPeriod.payment}` : "2주 전 매출 기준 · 매주 금요일 지급"} color={STEP_COLORS[1]} done={weeklyDone} active={activeStep==="weekly"} onClick={()=>setActiveStep(activeStep==="weekly"?"history":"weekly")} />
        {activeStep==="weekly" && (
          <div style={{padding:"20px 24px",borderTop:`1px solid ${STEP_COLORS[1]}22`}}>
            <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              {/* 기간 안내 */}
              {weeklyPeriod && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"10px"}}>
                  {[
                    {label:"정산 대상 기간",value:`${weeklyPeriod.start} ~ ${weeklyPeriod.end}`,color:"#4FA3E8"},
                    {label:"지급 예정일",   value:weeklyPeriod.payment,                          color:STEP_COLORS[1]},
                  ].map(s=>(
                    <div key={s.label} style={{padding:"14px 16px",borderRadius:"12px",background:"var(--bg)",border:`1px solid ${s.color}22`}}>
                      <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"4px"}}>{s.label}</p>
                      <p style={{fontSize:"15px",fontWeight:700,color:s.color}}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 회원 검색 */}
              <div style={{position:"relative"}}>
                <input value={weeklySearch} onChange={e=>setWeeklySearch(e.target.value)} placeholder="회원번호 · 전화번호 · 이메일로 검색" className="input-base" style={{paddingLeft:"36px",fontSize:"13px"}}/>
                <Users size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",pointerEvents:"none"}}/>
              </div>

              <button onClick={calcWeekly} disabled={weeklyCalc} style={{
                display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                padding:"13px",borderRadius:"12px",
                background:`linear-gradient(135deg, ${STEP_COLORS[1]}, #00A882)`,
                border:"none",color:"#fff",fontSize:"14px",fontWeight:700,cursor:weeklyCalc?"not-allowed":"pointer",
                boxShadow:`0 4px 16px ${STEP_COLORS[1]}44`,
              }}>
                {weeklyCalc ? <><RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/> 계산 중...</> : <><Play size={16}/> 주간 수당 계산</>}
              </button>

              {/* 결과 테이블 */}
              {weeklyResult.length>0 && (
                <>
                  <div style={{background:"var(--bg)",borderRadius:"14px",overflow:"hidden",border:"1px solid var(--bg-border)"}}>
                    <div style={{padding:"12px 16px",borderBottom:"1px solid var(--bg-border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>지급 대상 {weeklyResult.filter(r=>!weeklySearch||(r.name.includes(weeklySearch)||r.code.includes(weeklySearch))).length}명</span>
                      <span style={{fontSize:"13px",fontWeight:700,color:STEP_COLORS[1]}}>{formatKRW(weeklyResult.reduce((s,r)=>s+r.net,0))} 지급 예정</span>
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:"600px"}}>
                        <thead><tr style={{borderBottom:"1px solid var(--bg-border)"}}>
                          {["회원","직급","판매수당","추천수당","오버라이딩","세전합계","세후 실수령","계좌"].map(h=>(
                            <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",color:"var(--text-muted)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {weeklyResult.filter(r=>!weeklySearch||(r.name.includes(weeklySearch)||r.code.includes(weeklySearch)||r.account?.includes(weeklySearch))).map((r,i)=>(
                            <tr key={r.id} style={{borderBottom:"1px solid var(--bg-border)"}}>
                              <td style={{padding:"11px 14px"}}>
                                <p style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{r.name}</p>
                                <p style={{fontSize:"11px",color:"var(--text-muted)",fontFamily:"monospace"}}>{r.code}</p>
                              </td>
                              <td style={{padding:"11px 14px"}}>
                                <span style={{padding:"2px 8px",borderRadius:"999px",fontSize:"11px",fontWeight:600,background:`${r.rank?.color}22`,color:r.rank?.color}}>{r.rank?.name}</span>
                              </td>
                              <td style={{padding:"11px 14px",fontSize:"13px",color:"#4FA3E8",fontWeight:500}}>{formatKRW(r.sales)}</td>
                              <td style={{padding:"11px 14px",fontSize:"13px",color:"#FF9500",fontWeight:500}}>{formatKRW(r.ref)}</td>
                              <td style={{padding:"11px 14px",fontSize:"13px",color:"#E8599A",fontWeight:500}}>{formatKRW(r.over)}</td>
                              <td style={{padding:"11px 14px",fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{formatKRW(r.gross)}</td>
                              <td style={{padding:"11px 14px",fontSize:"14px",fontWeight:800,color:STEP_COLORS[1]}}>{formatKRW(r.net)}</td>
                              <td style={{padding:"11px 14px",fontSize:"12px",color:"var(--text-muted)"}}>{r.bank} {r.account}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <button onClick={confirmWeekly} disabled={weeklyDone} style={{
                    display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                    padding:"14px",borderRadius:"12px",
                    background: weeklyDone ? "rgba(0,200,150,0.1)" : `linear-gradient(135deg, #00C896, #00A882)`,
                    border: weeklyDone ? "1px solid rgba(0,200,150,0.3)" : "none",
                    color: weeklyDone ? "#00C896" : "#fff",
                    fontSize:"14px",fontWeight:800,cursor:weeklyDone?"default":"pointer",
                  }}>
                    {weeklyDone ? <><CheckCircle size={16}/> 정산 완료</> : <><CheckCircle size={16}/> 정산 확정 및 지급 처리</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 3: 월간 공유수당 ── */}
      <div style={{background:"var(--bg-elevated)",border:`1.5px solid ${activeStep==="monthly" ? STEP_COLORS[2] : "var(--bg-border)"}`,borderRadius:"18px",overflow:"hidden",transition:"border-color 0.2s"}}>
        <StepHeader step={3} title="월간 공유수당" desc="이번 달 전체 매출 기준 · 매니저 2% + 디렉터 2% + 관리자 재량 1%" color={STEP_COLORS[2]} done={monthlyDone} active={activeStep==="monthly"} onClick={()=>setActiveStep(activeStep==="monthly"?"history":"monthly")} />
        {activeStep==="monthly" && (
          <div style={{padding:"20px 24px",borderTop:`1px solid ${STEP_COLORS[2]}22`}}>
            <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              <button onClick={calcMonthly} disabled={monthlyCalc} style={{
                display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                padding:"13px",borderRadius:"12px",
                background:`linear-gradient(135deg, ${STEP_COLORS[2]}, #E07000)`,
                border:"none",color:"#fff",fontSize:"14px",fontWeight:700,cursor:monthlyCalc?"not-allowed":"pointer",
                boxShadow:`0 4px 16px ${STEP_COLORS[2]}44`,
              }}>
                {monthlyCalc ? <><RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/> 계산 중...</> : <><Play size={16}/> 이번달 공유수당 계산</>}
              </button>

              {monthlyData && (
                <>
                  {/* 공유수당 풀 */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"10px"}}>
                    {[
                      {label:"전체 월 매출",     value:formatKRW(monthlyData.total_monthly_revenue),  color:"var(--text-primary)", sub:""},
                      {label:"매니저 풀 2%",      value:formatKRW(monthlyData.manager_pool),           color:"#FF9500", sub:`${monthlyData.manager_count}명 · 1인당 ${formatKRW(monthlyData.per_manager)}`},
                      {label:"디렉터 풀 2%",      value:formatKRW(monthlyData.director_pool),          color:"#E8599A", sub:`${monthlyData.director_count}명 · 1인당 ${formatKRW(monthlyData.per_director)}`},
                      {label:"관리자 재량 1%",    value:formatKRW(monthlyData.admin_discretion),       color:"#6C47FF", sub:"직접 지정"},
                    ].map(s=>(
                      <div key={s.label} style={{padding:"16px",borderRadius:"14px",background:"var(--bg)",border:`1px solid ${s.color}22`}}>
                        <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"4px"}}>{s.label}</p>
                        <p style={{fontFamily:"Syne,sans-serif",fontSize:"20px",fontWeight:800,color:s.color,marginBottom:"2px"}}>{s.value}</p>
                        {s.sub && <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{s.sub}</p>}
                      </div>
                    ))}
                  </div>

                  {/* 관리자 재량 대상자 지정 */}
                  <div style={{background:"rgba(108,71,255,0.05)",border:"1px solid rgba(108,71,255,0.2)",borderRadius:"14px",padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <Star size={15} color="#6C47FF"/>
                        <span style={{fontSize:"13px",fontWeight:700,color:"#6C47FF"}}>관리자 재량 1% 지급 대상</span>
                        <span style={{fontSize:"11px",color:"var(--text-muted)"}}>잔액: {formatKRW(monthlyData.admin_discretion - discretionList.reduce((s,d)=>s+d.amount,0))}</span>
                      </div>
                      <button onClick={()=>setDiscretionList(d=>[...d,{memberId:"",name:"",amount:0,reason:""}])} style={{padding:"5px 12px",borderRadius:"8px",background:"rgba(108,71,255,0.15)",border:"1px solid rgba(108,71,255,0.3)",color:"#6C47FF",cursor:"pointer",fontSize:"12px",fontWeight:600}}>+ 추가</button>
                    </div>
                    {discretionList.map((d,i)=>(
                      <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 2fr auto",gap:"8px",marginBottom:"8px",alignItems:"center"}}>
                        <select className="input-base" style={{fontSize:"12px",padding:"7px 10px"}} value={d.memberId} onChange={e=>{
                          const m = allMembers.find(am=>am.id===e.target.value);
                          setDiscretionList(dl=>dl.map((item,idx)=>idx===i?{...item,memberId:e.target.value,name:m?.name??""}:item));
                        }}>
                          <option value="">회원 선택</option>
                          {allMembers.map(m=><option key={m.id} value={m.id}>{m.name} ({m.member_code})</option>)}
                        </select>
                        <input type="number" className="input-base" style={{fontSize:"12px",padding:"7px 10px"}} placeholder="금액" value={d.amount||""} onChange={e=>setDiscretionList(dl=>dl.map((item,idx)=>idx===i?{...item,amount:Number(e.target.value)}:item))}/>
                        <input className="input-base" style={{fontSize:"12px",padding:"7px 10px"}} placeholder="지급 사유" value={d.reason} onChange={e=>setDiscretionList(dl=>dl.map((item,idx)=>idx===i?{...item,reason:e.target.value}:item))}/>
                        <button onClick={()=>setDiscretionList(dl=>dl.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#F87171",padding:"4px"}}>✕</button>
                      </div>
                    ))}
                  </div>

                  <button onClick={confirmMonthly} disabled={monthlyDone} style={{
                    display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                    padding:"14px",borderRadius:"12px",
                    background: monthlyDone ? "rgba(0,200,150,0.1)" : `linear-gradient(135deg, ${STEP_COLORS[2]}, #E07000)`,
                    border: monthlyDone ? "1px solid rgba(0,200,150,0.3)" : "none",
                    color: monthlyDone ? "#00C896" : "#fff",
                    fontSize:"14px",fontWeight:800,cursor:monthlyDone?"default":"pointer",
                  }}>
                    {monthlyDone ? <><CheckCircle size={16}/> 월간 공유수당 지급 완료</> : <><CheckCircle size={16}/> 월간 공유수당 확정 및 지급</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 마감 이력 ── */}
      <div style={{background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",borderRadius:"18px",overflow:"hidden"}}>
        <StepHeader step="📋" title="마감 이력" desc="일일 마감 기록 조회" color={STEP_COLORS[4]} done={false} active={activeStep==="history"} onClick={async()=>{
          if (activeStep!=="history") {
            setHistoryLoading(true);
            const supabase = createBrowserSupabaseClient();
            const { data } = await supabase.from("daily_closings").select("*").order("closing_date",{ascending:false}).limit(30);
            setClosingHistory(data??[]);
            setHistoryLoading(false);
          }
          setActiveStep(activeStep==="history"?"daily":"history");
        }} />
        {activeStep==="history" && (
          <div style={{padding:"0 0 8px"}}>
            {historyLoading ? <div style={{padding:"24px",textAlign:"center",color:"var(--text-muted)",fontSize:"13px"}}>불러오는 중...</div>
            : closingHistory.length===0 ? <div style={{padding:"24px",textAlign:"center",color:"var(--text-muted)",fontSize:"13px"}}>마감 이력이 없습니다</div>
            : closingHistory.map((c,i)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:"16px",padding:"13px 24px",borderBottom: i<closingHistory.length-1 ? "1px solid var(--bg-border)" : "none"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#00C896",flexShrink:0}}/>
                <span style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)",minWidth:"100px"}}>{c.closing_date}</span>
                <span style={{fontSize:"12px",color:"var(--text-muted)"}}>주문 {c.total_orders}건</span>
                <span style={{fontSize:"13px",fontWeight:600,color:"#00C896"}}>{formatKRW(c.total_revenue)}</span>
                <span style={{fontSize:"12px",color:"#FF9500"}}>수당 {formatKRW(c.total_commission)}</span>
                {c.rank_changes>0 && <span style={{fontSize:"12px",color:"#E8599A"}}>직급변경 {c.rank_changes}명</span>}
                <span style={{marginLeft:"auto",padding:"2px 10px",borderRadius:"999px",fontSize:"11px",fontWeight:600,background:"rgba(0,200,150,0.1)",color:"#00C896"}}>완료</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

