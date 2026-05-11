"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserSupabaseClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    // 관리자 여부 확인
    const { data: member } = await supabase
      .from("members")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (!member?.is_admin) {
      await supabase.auth.signOut();
      setError("관리자 계정이 아닙니다.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[100px]"
          style={{ background: "rgba(79,142,247,0.06)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--bg-border) 1px, transparent 1px), linear-gradient(90deg, var(--bg-border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm px-6">
        <div className="text-center mb-8 animate-slide-up">
          <div style={{
            width: 56, height: 56, borderRadius: "16px", margin: "0 auto 14px",
            background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={26} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            관리자 로그인
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>BangpanPRO Admin</p>
        </div>

        <div className="animate-slide-up delay-100" style={{
          background: "var(--bg-surface)", border: "1px solid rgba(79,142,247,0.2)",
          borderRadius: "20px", padding: "28px", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 32, right: 32, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent)",
          }} />

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 500 }}>이메일</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com" required className="input-base"
                  style={{ paddingLeft: "36px" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 500 }}>비밀번호</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input-base"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "10px", fontSize: "13px",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#F87171",
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", marginTop: "4px",
              background: "var(--accent)", color: "#fff",
              fontWeight: 700, padding: "12px", borderRadius: "10px",
              border: "none", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 14px rgba(79,142,247,0.3)",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  로그인 중...
                </>
              ) : (
                <><Shield size={15} /> 관리자 로그인</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
