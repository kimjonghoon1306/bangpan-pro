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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === "admin@test.com") router.push("/dashboard");
      else router.push("/portal");
      setLoading(false);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--bg-border) 1px, transparent 1px), linear-gradient(90deg, var(--bg-border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated border border-gold/20 mb-5">
            <TrendingUp className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "Syne, sans-serif" }}>
            BangpanPRO
          </h1>
          <p className="text-sm mt-2 text-text-muted">방문판매 수당 관리 플랫폼</p>
        </div>

        <div className="relative rounded-2xl p-8 bg-bg-surface border border-bg-border animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <h2 className="text-lg font-semibold mb-6 text-text-primary">로그인</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium text-text-muted">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  required
                  className="input-base"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5 font-medium text-text-muted">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </>
              ) : "로그인"}
            </button>
          </form>

          <div className="mt-6 pt-6 flex items-center justify-between text-xs border-t border-bg-border">
            <span className="text-text-muted">비밀번호를 잊으셨나요?</span>
            <button className="text-gold hover:text-gold-light transition-colors">비밀번호 재설정</button>
          </div>
        </div>

        <p className="text-center text-xs mt-8 text-text-muted">© 2024 BangpanPRO. All rights reserved.</p>
      </div>
    </div>
  );
}
