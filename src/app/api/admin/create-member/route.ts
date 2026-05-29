import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, rank_id, sponsor_code, bank_name, bank_account, bank_holder } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 이메일 인증 없이 즉시 활성화
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

    const userId = authData.user.id;

    let sponsorId: string | null = null;
    if (sponsor_code) {
      const { data: sponsor } = await supabaseAdmin.from("members").select("id").eq("member_code", sponsor_code).single();
      sponsorId = sponsor?.id ?? null;
    }

    const { count } = await supabaseAdmin.from("members").select("*", { count: "exact", head: true });
    const memberCode = `M-${String((count ?? 0) + 1).padStart(6, "0")}`;

    const { error: memberErr } = await supabaseAdmin.from("members").insert({
      id: userId, member_code: memberCode,
      name, email, phone: phone || null,
      rank_id: rank_id || null, sponsor_id: sponsorId,
      bank_name: bank_name || null, bank_account: bank_account || null, bank_holder: bank_holder || null,
      status: "ACTIVE", is_admin: false,
      joined_at: new Date().toISOString().split("T")[0],
    });
    if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 400 });

    await supabaseAdmin.from("member_paths").insert({ ancestor_id: userId, descendant_id: userId, depth: 0 });
    if (sponsorId) {
      const { data: sponsorPaths } = await supabaseAdmin.from("member_paths").select("ancestor_id, depth").eq("descendant_id", sponsorId);
      const newPaths = (sponsorPaths ?? []).map((p: any) => ({ ancestor_id: p.ancestor_id, descendant_id: userId, depth: p.depth + 1 }));
      if (newPaths.length) await supabaseAdmin.from("member_paths").insert(newPaths);
    }

    return NextResponse.json({ success: true, member_code: memberCode });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

