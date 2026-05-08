"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, TrendingUp } from "lucide-react";

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
    // TODO: Supabase auth
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
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/5 blur-[100px]" />
        {/* 격자 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* 로고 */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated border border-gold/20 shadow-gold mb-5">
            <TrendingUp className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">
            BangpanPRO
          </h1>
          <p className="text-text-muted text-sm mt-2 tracking-wide">
            방문판매 수당 관리 플랫폼
          </p>
        </div>

        {/* 카드 */}
        <div
          className="animate-slide-up delay-100 relative bg-bg-surface rounded-2xl border border-bg-border p-8 shadow-elevated"
        >
          {/* 상단 골드 라인 */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <h2 className="text-lg font-semibold text-text-primary mb-6">로그인</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  required
                  className="input-base pl-10"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-6 relative"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="mt-6 pt-6 border-t border-bg-border flex items-center justify-between text-xs">
            <span className="text-text-muted">비밀번호를 잊으셨나요?</span>
            <button className="text-gold hover:text-gold-light transition-colors">
              비밀번호 재설정
            </button>
          </div>
        </div>

        {/* 하단 */}
        <p className="text-center text-text-muted text-xs mt-8 animate-slide-up delay-200">
          © 2024 BangpanPRO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
