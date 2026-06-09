"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, TrendingUp, Settings } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import CompanyFooter from "@/components/ui/CompanyFooter";

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

    const supabase = createBrowserSupabaseClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/portal");
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(var(--bg-border) 1px, transparent 1px), linear-gradient(90deg, var(--bg-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* 우상단 테마토글 */}
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      {/* 우하단 관리자 톱니바퀴 */}
      <button
        onClick={() => router.push("/admin-login")}
        title="관리자 로그인"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--bg-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "all 0.25s",
          zIndex: 100,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(201,168,76,0.5)";
          el.style.color = "var(--gold)";
          el.style.transform = "rotate(45deg) scale(1.1)";
          el.style.boxShadow = "0 4px 20px rgba(201,168,76,0.2)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--bg-border)";
          el.style.color = "var(--text-muted)";
          el.style.transform = "rotate(0deg) scale(1)";
          el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
        }}
      >
        <Settings size={20} />
      </button>

      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-10 animate-slide-up">
          <div style={{ width:60,height:60,borderRadius:"16px",margin:"0 auto 16px",background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <TrendingUp size={28} color="var(--gold)" />
          </div>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:"26px",fontWeight:800,color:"var(--text-primary)" }}>온종일 프로젝트</h1>
          <p style={{ fontSize:"13px",color:"var(--text-muted)",marginTop:"4px" }}>방문판매 수당 관리 플랫폼</p>
        </div>

        <div className="animate-slide-up delay-100" style={{ background:"var(--bg-surface)",border:"1px solid var(--bg-border)",borderRadius:"20px",padding:"28px",position:"relative" }}>
          <div style={{ position:"absolute",top:0,left:32,right:32,height:"1px",background:"linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
          <h2 style={{ fontSize:"16px",fontWeight:700,color:"var(--text-primary)",marginBottom:"20px" }}>회원 로그인</h2>

          <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
            <div>
              <label style={{ display:"block",fontSize:"12px",color:"var(--text-muted)",marginBottom:"6px",fontWeight:500 }}>이메일</label>
              <div style={{ position:"relative" }}>
                <Mail size={15} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",pointerEvents:"none" }} />
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@company.com" required className="input-base" style={{ paddingLeft:"36px" }} />
              </div>
            </div>
            <div>
              <label style={{ display:"block",fontSize:"12px",color:"var(--text-muted)",marginBottom:"6px",fontWeight:500 }}>비밀번호</label>
              <div style={{ position:"relative" }}>
                <Lock size={15} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",pointerEvents:"none" }} />
                <input type={showPw?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required className="input-base" style={{ paddingLeft:"36px",paddingRight:"40px" }} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding:"10px 14px",borderRadius:"10px",fontSize:"13px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#F87171" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-gold" style={{ width:"100%",marginTop:"4px" }}>
              {loading ? (
                <><span style={{ width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTop:"2px solid #08080E",borderRadius:"50%",animation:"spin 1s linear infinite" }} />로그인 중...</>
              ) : "로그인"}
            </button>
          </form>

          <div style={{ marginTop:"20px",paddingTop:"20px",borderTop:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <Link href="/signup" style={{ fontSize:"13px",color:"var(--text-muted)",textDecoration:"none" }}>
              계정이 없으신가요? <span style={{ color:"var(--gold)",fontWeight:600 }}>회원가입</span>
            </Link>
            <button style={{ background:"none",border:"none",cursor:"pointer",fontSize:"13px",color:"var(--text-muted)" }}>비밀번호 찾기</button>
          </div>
        </div>
        <CompanyFooter variant="login" />
      </div>
    </div>
  );
}
