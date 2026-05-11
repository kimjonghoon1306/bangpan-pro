"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AdminFab() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from("members")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (member?.is_admin) setIsAdmin(true);
    }
    checkAdmin();
  }, []);

  if (!isAdmin) return null;

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
        border: "1px solid var(--bg-border)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 0.2s",
        color: "var(--text-muted)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(201,168,76,0.15)";
        el.style.borderColor = "rgba(201,168,76,0.4)";
        el.style.color = "var(--gold)";
        el.style.transform = "scale(1.08) rotate(30deg)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--bg-elevated)";
        el.style.borderColor = "var(--bg-border)";
        el.style.color = "var(--text-muted)";
        el.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      <Settings size={20} />
    </button>
  );
}
