import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const body = await req.json();
    const { residentNumber, amount, bankName, bankAccount, bankHolder, weekStart, weekEnd, paymentDate } = body;

    if (!residentNumber || residentNumber.replace(/[^0-9]/g,"").length !== 13)
      return NextResponse.json({ error: "주민등록번호 13자리를 입력해주세요" }, { status: 400 });
    if (!bankAccount)
      return NextResponse.json({ error: "계좌 정보가 없습니다" }, { status: 400 });

    const encrypted = encrypt(residentNumber.replace(/[^0-9]/g,""));

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    await supabaseAdmin.from("members").update({
      resident_number_enc: encrypted, resident_verified: true,
    }).eq("id", session.user.id);

    const grossAmount = amount;
    const taxAmount = Math.floor(grossAmount * 0.033);
    const netAmount = grossAmount - taxAmount;

    const { error: err } = await supabaseAdmin.from("withdrawal_requests").insert({
      member_id: session.user.id,
      amount: grossAmount, tax_amount: taxAmount, net_amount: netAmount,
      bank_name: bankName, bank_account: bankAccount, bank_holder: bankHolder,
      resident_number_enc: encrypted,
      status: "PENDING",
      week_start: weekStart, week_end: weekEnd, payment_date: paymentDate,
    });

    if (err) return NextResponse.json({ error: err.message }, { status: 400 });

    await supabaseAdmin.from("members").update({ withdrawal_available: 0 }).eq("id", session.user.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 관리자 세션 확인
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 관리자 권한 확인
    const { data: me } = await supabaseAdmin.from("members").select("is_admin").eq("id", session.user.id).single();
    if (!me?.is_admin) return NextResponse.json({ error: "관리자 권한 필요" }, { status: 403 });

    const memberId = req.nextUrl.searchParams.get("member_id");
    if (!memberId) return NextResponse.json({ error: "member_id 필요" }, { status: 400 });

    const { data } = await supabaseAdmin.from("members").select("resident_number_enc").eq("id", memberId).single();
    if (!data?.resident_number_enc) return NextResponse.json({ error: "주민번호 없음" }, { status: 404 });

    try {
      const decrypted = decrypt(data.resident_number_enc);
      // 마스킹만 반환 — 평문 주민번호는 절대 반환하지 않음
      const masked = decrypted.slice(0, 6) + "-" + decrypted[6] + "******";
      return NextResponse.json({ masked });
    } catch {
      return NextResponse.json({ error: "복호화 실패. 암호화 키를 확인해주세요." }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

