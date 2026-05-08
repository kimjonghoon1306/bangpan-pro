"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LoginPage() {
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
    setTimeout(() => {
      if (email === "admin@test.com") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(201,168,76,0.05)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* 테마 토글 — 우상단 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* 로고 */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <TrendingUp className="w-8 h-8" style={{ color: "var(--gold)" }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
            BangpanPRO
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>방문판매 수당 관리 플랫폼</p>
        </div>

        {/* 카드 */}
        <div className="relative rounded-2xl p-8 animate-slide-up" style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}>
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

          <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>로그인</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>이메일</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" required className="input-base pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-base pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-6">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : "로그인"}
            </button>
          </form>

          <div className="mt-6 pt-6 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--bg-border)" }}>
            <span style={{ color: "var(--text-muted)" }}>비밀번호를 잊으셨나요?</span>
            <button className="transition-colors" style={{ color: "var(--gold)" }}>비밀번호 재설정</button>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>© 2024 BangpanPRO. All rights reserved.</p>
      </div>
    </div>
  );
}
