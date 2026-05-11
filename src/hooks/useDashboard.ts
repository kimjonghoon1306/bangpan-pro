import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface DashboardStats {
  total_members: number;
  active_members: number;
  new_today: number;
  monthly_orders: number;
  monthly_revenue: number;
  monthly_pv: number;
  pending_orders: number;
  monthly_commission: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_members: 0, active_members: 0, new_today: 0,
    monthly_orders: 0, monthly_revenue: 0, monthly_pv: 0,
    pending_orders: 0, monthly_commission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [
        { count: total_members },
        { count: active_members },
        { count: new_today },
        { data: monthOrders },
        { count: pending_orders },
        { data: settlement },
      ] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }).eq("is_admin", false),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "ACTIVE").eq("is_admin", false),
        supabase.from("members").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("orders").select("total_price, total_pv").eq("status", "PAID").gte("paid_at", monthStart),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
        supabase.from("settlement_periods").select("total_commission").eq("year", now.getFullYear()).eq("month", now.getMonth() + 1).single(),
      ]);

      const monthly_revenue = monthOrders?.reduce((s: number, o: any) => s + o.total_price, 0) ?? 0;
      const monthly_pv = monthOrders?.reduce((s: number, o: any) => s + o.total_pv, 0) ?? 0;
      const monthly_orders = monthOrders?.length ?? 0;

      // 월별 매출 차트 (최근 7일)
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
        const { data: dayOrders } = await supabase
          .from("orders").select("total_price")
          .eq("status", "PAID").gte("paid_at", dayStart).lt("paid_at", dayEnd);
        chartData.push({
          month: `${d.getMonth() + 1}/${d.getDate()}`,
          revenue: Math.floor((dayOrders?.reduce((s: number, o: any) => s + o.total_price, 0) ?? 0) / 10000),
        });
      }

      setStats({
        total_members: total_members ?? 0,
        active_members: active_members ?? 0,
        new_today: new_today ?? 0,
        monthly_orders,
        monthly_revenue,
        monthly_pv,
        pending_orders: pending_orders ?? 0,
        monthly_commission: (settlement as any)?.total_commission ?? 0,
      });
      setRevenueData(chartData);
      setLoading(false);
    }
    load();
  }, []);

  return { stats, loading, revenueData };
}
