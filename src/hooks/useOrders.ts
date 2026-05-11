import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface Order {
  id: string;
  order_code: string;
  member_id: string;
  member: { name: string; member_code: string } | null;
  total_price: number;
  total_pv: number;
  total_bv: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export function useOrders(opts?: { status?: string; member_id?: string; page?: number }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = opts?.page ?? 1;
  const limit = 50;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      let query = supabase
        .from("orders")
        .select(`*, member:members(name, member_code)`, { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (opts?.status && opts.status !== "ALL") query = query.eq("status", opts.status);
      if (opts?.member_id) query = query.eq("member_id", opts.member_id);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setOrders((data as any) ?? []);
      setTotal(count ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [opts?.status, opts?.member_id, page]);

  useEffect(() => { fetch(); }, [fetch]);

  async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (err) throw err;
    await fetch();
  }

  return { orders, total, loading, error, refetch: fetch, updateOrderStatus };
}
