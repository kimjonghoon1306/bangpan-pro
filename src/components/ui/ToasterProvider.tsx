"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function ToasterProvider() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 초기 테마 감지
    setIsDark(document.documentElement.classList.contains("dark"));

    // 테마 변경 감지 (MutationObserver)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: isDark
          ? {
              background: "#161625",
              color: "#F0F0F8",
              border: "1px solid #1E1E30",
              borderRadius: "10px",
              fontSize: "14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }
          : {
              background: "#FFFFFF",
              color: "#0F0F1A",
              border: "1px solid #E4E6EF",
              borderRadius: "10px",
              fontSize: "14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
        success: {
          iconTheme: { primary: "#059669", secondary: isDark ? "#0F0F1A" : "#FFFFFF" },
        },
        error: {
          iconTheme: { primary: "#DC2626", secondary: isDark ? "#0F0F1A" : "#FFFFFF" },
        },
      }}
    />
  );
}
