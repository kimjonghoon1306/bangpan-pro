import { createBrowserSupabaseClient } from "@/lib/supabase";

// ─── 관리자 대시보드 ────────────────────────────────────
export async function fetchAdminDashboard() {
  const supabase = createBrowserSupabaseClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    { data: monthOrders },
    { data: todayOrders },
    { count: totalMembers },
    { data: rankDist },
    { data: recentOrders },
    { data: todayClosing },
  ] = await Promise.all([
    supabase.from("orders").select("total_price, status").neq("status","CANCELLED").gte("created_at", monthStart),
    supabase.from("orders").select("total_price, status").neq("status","CANCELLED").gte("created_at", todayStart),
    supabase.from("members").select("*", {count:"exact",head:true}).eq("is_admin",false),
    supabase.from("members").select("rank:ranks(name,color,level)", {count:"exact"}).eq("is_admin",false),
    supabase.from("orders").select("id, order_code, total_price, status, created_at, member:members(name)").order("created_at",{ascending:false}).limit(5),
    supabase.from("daily_closings").select("*").eq("closing_date", now.toISOString().split("T")[0]).maybeSingle(),
  ]);

  const monthRevenue = monthOrders?.reduce((s:number,o:any)=>s+o.total_price,0)??0;
  const todayRevenue = todayOrders?.reduce((s:number,o:any)=>s+o.total_price,0)??0;

  return { monthRevenue, todayRevenue, totalMembers: totalMembers??0, recentOrders: recentOrders??[], todayClosing };
}

// ─── 회원 포털 대시보드 ─────────────────────────────────
export async function fetchMemberPortal(userId: string) {
  const supabase = createBrowserSupabaseClient();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString();
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: member },
    { data: thisComm },
    { data: lastComm },
    { data: allComm },
    { data: recentComm },
  ] = await Promise.all([
    supabase.from("members").select("member_code, name, personal_pv, group_gv, left_volume, right_volume, withdrawal_available, rank:ranks(name,color), sponsor:members!sponsor_id(name)").eq("id", userId).single(),
    supabase.from("commissions").select("amount").eq("member_id", userId).gte("created_at", thisMonthStart),
    supabase.from("commissions").select("amount").eq("member_id", userId).gte("created_at", lastMonthStart).lt("created_at", lastMonthEnd),
    supabase.from("commissions").select("amount").eq("member_id", userId),
    supabase.from("commissions").select("id, amount, created_at, rule:commission_rules(name,rule_type), source_member:members!source_member_id(name)").eq("member_id", userId).order("created_at",{ascending:false}).limit(5),
  ]);

  return {
    member,
    thisMonth: thisComm?.reduce((s:number,c:any)=>s+c.amount,0)??0,
    lastMonth: lastComm?.reduce((s:number,c:any)=>s+c.amount,0)??0,
    totalCommission: allComm?.reduce((s:number,c:any)=>s+c.amount,0)??0,
    recentComm: recentComm??[],
  };
}

// ─── 정산 기간 목록 ─────────────────────────────────────
export async function fetchSettlementPeriods() {
  const supabase = createBrowserSupabaseClient();
  const now = new Date();
  // 이번달 기간 없으면 자동 생성
  const { data: existing } = await supabase.from("settlement_periods").select("id").eq("year", now.getFullYear()).eq("month", now.getMonth()+1).maybeSingle();
  if (!existing) {
    await supabase.from("settlement_periods").insert({ year: now.getFullYear(), month: now.getMonth()+1, status:"OPEN", total_bv:0, total_commission:0 });
  }
  const { data } = await supabase.from("settlement_periods").select("*").order("year",{ascending:false}).order("month",{ascending:false}).limit(6);
  return data??[];
}

// ─── 회원 목록 ──────────────────────────────────────────
export async function fetchMembers(page=0, limit=50, rankFilter?:string, search?:string) {
  const supabase = createBrowserSupabaseClient();
  let q = supabase.from("members").select("id, member_code, name, phone, email, status, personal_pv, group_gv, rank:ranks(id,name,color,level), created_at", {count:"exact"}).eq("is_admin",false).order("created_at",{ascending:false}).range(page*limit, (page+1)*limit-1);
  if (search) q = q.or(`name.ilike.%${search}%,member_code.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  const { data, count } = await q;
  return { members: data??[], total: count??0 };
}

// ─── 캘린더 한달치 데이터 ───────────────────────────────
export async function fetchCalendarMonth(year: number, month: number) {
  const supabase = createBrowserSupabaseClient();
  const start = new Date(year, month, 1).toISOString().split("T")[0];
  const end   = new Date(year, month+1, 0).toISOString().split("T")[0];

  const [
    { data: closings },
    { data: settlements },
    { data: orders },
  ] = await Promise.all([
    supabase.from("daily_closings").select("closing_date, total_revenue, total_commission, rank_changes").gte("closing_date", start).lte("closing_date", end),
    supabase.from("weekly_settlements").select("payment_date, status, total_commission").gte("payment_date", start).lte("payment_date", end),
    supabase.from("orders").select("paid_at, total_bv, total_price").eq("status","PAID").gte("paid_at", start+"T00:00:00").lte("paid_at", end+"T23:59:59"),
  ]);

  return {
    closings: closings??[],
    settlements: settlements??[],
    orders: orders??[],
  };
}
