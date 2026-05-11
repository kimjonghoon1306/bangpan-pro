"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AdminFab() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAdmin() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: member } = await supabase
          .from("members")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (member?.is_admin) setIsAdmin(true);
      } catch (e) {
        console.error(e);
      }
    }
    checkAdmin();
  }, []);

  if (!mounted || !isAdmin) return null;

  return (
    <button
      onClick={() => router.push("/dashboard")}
      title="관리자 페이지"
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        zIndex: 100,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "var(--bg-elevated)",
        border: "1px solid rgba(201,168,76,0.3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(201,168,76,0.15)",
        transition: "all 0.25s",
        color: "var(--gold)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1.1) rotate(45deg)";
        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.4), 0 0 20px rgba(201,168,76,0.3)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1) rotate(0deg)";
        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(201,168,76,0.15)";
      }}
    >
      <Settings size={20} />
    </button>
  );
}
