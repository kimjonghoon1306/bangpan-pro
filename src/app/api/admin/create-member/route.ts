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

    // 중복 방지: 타임스탬프 + 랜덤으로 고유 코드 생성 후 충돌 시 재시도
    let memberCode = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
      const candidate = `M-${ts}${rand}`;
      const { data: existing } = await supabaseAdmin.from("members").select("id").eq("member_code", candidate).maybeSingle();
      if (!existing) { memberCode = candidate; break; }
    }
    if (!memberCode) return NextResponse.json({ error: "회원코드 생성 실패. 다시 시도해주세요." }, { status: 500 });

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

