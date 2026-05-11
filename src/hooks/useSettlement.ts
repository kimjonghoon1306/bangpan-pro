import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface SettlementPeriod {
  id: string;
  year: number;
  month: number;
  status: string;
  total_bv: number;
  total_commission: number;
  calculated_at: string | null;
  paid_at: string | null;
}

export interface Commission {
  id: string;
  member_id: string;
  member: { name: string; member_code: string } | null;
  rule: { name: string } | null;
  depth: number;
  base_amount: number;
  rate: number | null;
  amount: number;
  status: string;
}

export interface Payout {
  id: string;
  member_id: string;
  member: { name: string; member_code: string } | null;
  gross_amount: number;
  tax_amount: number;
  net_amount: number;
  bank_name: string | null;
  bank_account: string | null;
  bank_holder: string | null;
  status: string;
}

export function useSettlement() {
  const [periods, setPeriods] = useState<SettlementPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("settlement_periods")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(12);
    setPeriods(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  async function createPeriod(year: number, month: number) {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("settlement_periods")
      .insert({ year, month, status: "OPEN" })
      .select()
      .single();
    if (error) throw error;
    await fetchPeriods();
    return data;
  }

  async function runSettlement(periodId: string) {
    const res = await fetch("/api/settlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period_id: periodId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchPeriods();
    return data;
  }

  return { periods, loading, fetchPeriods, createPeriod, runSettlement };
}

export function useCommissions(periodId: string) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    async function load() {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("commissions")
          .select(`*, member:members(name, member_code), rule:commission_rules(name)`)
          .eq("period_id", periodId)
          .order("amount", { ascending: false })
          .limit(100),
        supabase.from("payouts")
          .select(`*, member:members(name, member_code)`)
          .eq("period_id", periodId)
          .order("net_amount", { ascending: false }),
      ]);
      setCommissions((c as any) ?? []);
      setPayouts((p as any) ?? []);
      setLoading(false);
    }
    load();
  }, [periodId]);

  return { commissions, payouts, loading };
}
