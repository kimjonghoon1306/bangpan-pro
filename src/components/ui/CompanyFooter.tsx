"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

// 회사 정보 푸터 — 입력된 항목만 자연스럽게 표시 (빈 항목 자동 숨김)
export default function CompanyFooter({ variant = "portal" }: { variant?: "portal" | "login" }) {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.from("system_settings").select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: any) => { if (s.value) map[s.key] = s.value; });
      setInfo(map);
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded) return null;

  const name = info.company_name;
  // 사업자 정보 라인 — 값이 있는 것만 골라서 ' · '로 연결
  const bizLine = [
    info.company_ceo && `대표 ${info.company_ceo}`,
    info.company_biz_no && `사업자등록번호 ${info.company_biz_no}`,
    info.company_mailorder_no && `통신판매업 ${info.company_mailorder_no}`,
  ].filter(Boolean).join("  ·  ");
  const contactLine = [
    info.company_phone,
    info.company_email,
    info.company_address,
  ].filter(Boolean).join("  ·  ");

  // 표시할 게 회사명조차 없으면 푸터 자체를 숨김
  if (!name && !bizLine && !contactLine && !info.company_intro) return null;

  const muted = "var(--text-muted)";

  return (
    <div style={{
      marginTop: variant === "portal" ? "8px" : "20px",
      padding: variant === "portal" ? "18px 16px" : "16px",
      borderTop: variant === "portal" ? "1px solid var(--bg-border)" : "none",
      textAlign: "center",
      display: "flex", flexDirection: "column", gap: "5px",
    }}>
      {name && (
        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", margin: 0 }}>{name}</p>
      )}
      {info.company_intro && (
        <p style={{ fontSize: "11px", color: muted, margin: "0 0 2px", lineHeight: 1.5, maxWidth: "440px", marginLeft: "auto", marginRight: "auto" }}>
          {info.company_intro}
        </p>
      )}
      {bizLine && (
        <p style={{ fontSize: "10px", color: muted, margin: 0, lineHeight: 1.6 }}>{bizLine}</p>
      )}
      {contactLine && (
        <p style={{ fontSize: "10px", color: muted, margin: 0, lineHeight: 1.6 }}>{contactLine}</p>
      )}
      {name && (
        <p style={{ fontSize: "10px", color: muted, margin: "4px 0 0", opacity: 0.7 }}>
          © {name}. All rights reserved.
        </p>
      )}
    </div>
  );
}
