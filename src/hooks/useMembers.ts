import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface Member {
  id: string;
  member_code: string;
  name: string;
  email: string;
  phone: string | null;
  rank_id: string | null;
  rank: { name: string; level: number; color: string } | null;
  sponsor_id: string | null;
  sponsor: { name: string; member_code: string } | null;
  personal_pv: number;
  group_gv: number;
  left_volume: number;
  right_volume: number;
  bank_name: string | null;
  bank_account: string | null;
  bank_holder: string | null;
  status: string;
  is_admin: boolean;
  joined_at: string;
  created_at: string;
}

export function useMembers(opts?: { search?: string; status?: string; page?: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = opts?.page ?? 1;
  const limit = 50;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createBrowserSupabaseClient();
      let query = supabase
        .from("members")
        .select(`
          *,
          rank:ranks(name, level, color),
          sponsor:members!sponsor_id(name, member_code)
        `, { count: "exact" })
        .eq("is_admin", false)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (opts?.search) {
        query = query.or(`name.ilike.%${opts.search}%,member_code.ilike.%${opts.search}%,email.ilike.%${opts.search}%`);
      }
      if (opts?.status && opts.status !== "ALL") {
        query = query.eq("status", opts.status);
      }

      const { data, error: err, count } = await query;
      if (err) throw err;
      setMembers((data as any) ?? []);
      setTotal(count ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [opts?.search, opts?.status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { members, total, loading, error, refetch: fetch };
}

export function useMember(id: string) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data, error: err } = await supabase
        .from("members")
        .select(`*, rank:ranks(name, level, color), sponsor:members!sponsor_id(name, member_code)`)
        .eq("id", id)
        .single();
      if (err) setError(err.message);
      else setMember(data as any);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateMember(updates: Partial<Member>) {
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase
      .from("members")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (err) throw err;
    setMember(m => m ? { ...m, ...updates } : m);
  }

  return { member, loading, error, updateMember };
}
