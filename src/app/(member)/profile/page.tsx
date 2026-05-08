"use client";

import { useState } from "react";
import { Save, User, CreditCard, Lock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "info", label: "기본 정보", icon: User },
  { id: "bank", label: "계좌 정보", icon: CreditCard },
  { id: "password", label: "비밀번호", icon: Lock },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("info");

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary">내 정보</h2>
        <p className="text-text-muted text-sm mt-0.5">회원 정보 관리</p>
      </div>

      {/* 프로필 헤더 */}
      <div className="card-elevated flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-gold">김</span>
        </div>
        <div>
          <p className="font-semibold text-text-primary">김민수</p>
          <p className="text-xs text-text-muted font-mono">M-012847</p>
          <span className="badge badge-gold text-[10px] mt-1">골드</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-bg-elevated border border-bg-border rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
              tab === t.id ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="card space-y-4">
          {[
            { label: "이름", value: "김민수", type: "text" },
            { label: "이메일", value: "kim@test.com", type: "email" },
            { label: "전화번호", value: "010-1234-5678", type: "tel" },
            { label: "주소", value: "", type: "text", placeholder: "주소를 입력하세요" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              <input type={f.type} defaultValue={f.value} placeholder={f.placeholder} className="input-base text-sm" />
            </div>
          ))}
          <button className="btn-gold flex items-center gap-2 text-sm w-full justify-center mt-2">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {tab === "bank" && (
        <div className="card space-y-4">
          <p className="text-xs text-text-muted bg-gold/5 border border-gold/15 rounded-lg px-3 py-2">
            수당 지급 시 사용되는 계좌 정보입니다. 정확하게 입력해주세요.
          </p>
          {[
            { label: "은행명", type: "select", options: ["국민은행", "신한은행", "우리은행", "하나은행", "농협", "기업은행", "카카오뱅크", "토스뱅크"] },
            { label: "계좌번호", type: "text", placeholder: "- 없이 입력" },
            { label: "예금주", type: "text", placeholder: "예금주명" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              {f.type === "select" ? (
                <select className="input-base text-sm">
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={f.placeholder} className="input-base text-sm" />
              )}
            </div>
          ))}
          <button className="btn-gold flex items-center gap-2 text-sm w-full justify-center mt-2">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {tab === "password" && (
        <div className="card space-y-4">
          {[
            { label: "현재 비밀번호", placeholder: "••••••••" },
            { label: "새 비밀번호", placeholder: "8자 이상" },
            { label: "새 비밀번호 확인", placeholder: "••••••••" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              <input type="password" placeholder={f.placeholder} className="input-base text-sm" />
            </div>
          ))}
          <button className="btn-gold flex items-center gap-2 text-sm w-full justify-center mt-2">
            <Save className="w-4 h-4" />
            변경
          </button>
        </div>
      )}
    </div>
  );
}
