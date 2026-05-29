"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const BANKS = ["국민은행","신한은행","우리은행","하나은행","농협","기업은행","카카오뱅크","토스뱅크","SC제일은행","씨티은행"];

export default function NewMemberPage() {
  const router = useRouter();
  const [ranks, setRanks] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", rank_id: "", sponsor_code: "", bank_name: "", bank_account: "", bank_holder: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const [{ data: rankData }, { data: memberData }] = await Promise.all([
        supabase.from("ranks").select("id, name, level, color").order("level"),
        supabase.from("members").select("id, name, member_code").eq("is_admin", false).order("name").limit(200),
      ]);
      setRanks(rankData ?? []);
      if (rankData?.length) setForm(f => ({ ...f, rank_id: rankData[0].id }));
      setSponsors((memberData as any) ?? []);
    }
    load();
  }, []);

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("이름, 이메일, 비밀번호는 필수입니다."); return; }
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    // Supabase Auth 계정 생성
    const { data: authData, error: authErr } = await supabase.auth.admin
      ? { data: null, error: { message: "admin not available" } }
      : { data: null, error: null };

    // signUp 사용
    // API route로 회원 등록 (이메일 인증 없이 즉시 활성화)
    const res = await fetch("/api/admin/create-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, rank_id: form.rank_id, sponsor_code: form.sponsor_code,
        bank_name: form.bank_name, bank_account: form.bank_account, bank_holder: form.bank_holder,
      }),
    });
    const json = await res.json();
    if (!res.ok || json.error) { setError(json.error ?? "등록 실패"); setLoading(false); return; }

    setLoading(false);
    router.push("/members");
  }

  const labelStyle = { display: "block" as const, fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px", fontWeight: 600 as const };

  return (
    <div style={{ padding: "20px", maxWidth: "680px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <Link href="/members" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", textDecoration: "none" }}><ArrowLeft size={16} /></Link>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>회원 등록</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>새 회원을 직접 등록합니다</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* 기본 정보 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>기본 정보</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div><label style={labelStyle}>이름 *</label><input className="input-base" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div><label style={labelStyle}>이메일 *</label><input type="email" className="input-base" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
            <div><label style={labelStyle}>전화번호</label><input className="input-base" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="010-0000-0000" /></div>
            <div><label style={labelStyle}>비밀번호 *</label><input type="password" className="input-base" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="8자 이상" /></div>
          </div>
        </div>

        {/* 직급 + 추천인 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>직급 및 조직</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={labelStyle}>직급</label>
              <select className="input-base" value={form.rank_id} onChange={(e) => update("rank_id", e.target.value)}>
                {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>추천인 회원번호</label>
              <input className="input-base" value={form.sponsor_code} onChange={(e) => update("sponsor_code", e.target.value)} placeholder="M-000001" />
            </div>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>계좌 정보</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <div>
              <label style={labelStyle}>은행</label>
              <select className="input-base" value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)}>
                <option value="">선택</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>계좌번호</label><input className="input-base" value={form.bank_account} onChange={(e) => update("bank_account", e.target.value)} /></div>
            <div><label style={labelStyle}>예금주</label><input className="input-base" value={form.bank_holder} onChange={(e) => update("bank_holder", e.target.value)} /></div>
          </div>
        </div>

        {error && <p style={{ fontSize: "13px", color: "#F87171", padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "12px", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          <UserPlus size={18} />{loading ? "등록 중..." : "회원 등록"}
        </button>
      </div>
    </div>
  );
}
