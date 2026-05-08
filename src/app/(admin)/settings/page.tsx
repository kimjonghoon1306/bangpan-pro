"use client";

import { useState } from "react";
import { Save, Building2, Calendar, CreditCard, Shield, Database } from "lucide-react";

const TABS = [
  { id: "company", label: "회사 정보", icon: Building2 },
  { id: "settlement", label: "정산 설정", icon: Calendar },
  { id: "rank", label: "직급 설정", icon: Shield },
  { id: "payment", label: "결제 설정", icon: CreditCard },
];

const RANKS = [
  { code: "RANK_01", name: "일반회원", level: 1, min_pv: 0, min_gv: 0, min_direct: 0, color: "#444466" },
  { code: "RANK_02", name: "실버", level: 2, min_pv: 200, min_gv: 1000, min_direct: 2, color: "#94A3B8" },
  { code: "RANK_03", name: "골드", level: 3, min_pv: 500, min_gv: 5000, min_direct: 5, color: "#C9A84C" },
  { code: "RANK_04", name: "플래티넘", level: 4, min_pv: 1000, min_gv: 20000, min_direct: 10, color: "#818CF8" },
  { code: "RANK_05", name: "다이아", level: 5, min_pv: 2000, min_gv: 80000, min_direct: 20, color: "#38BDF8" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("company");

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">시스템 설정</h1>
        <p className="text-text-muted text-sm mt-0.5">회사 정보 및 운영 설정</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-bg-elevated border border-bg-border rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              tab === t.id ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 회사 정보 */}
      {tab === "company" && (
        <div className="card-elevated space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">회사 기본 정보</h3>
          {[
            { label: "회사명", placeholder: "주식회사 예시", defaultValue: "" },
            { label: "대표자명", placeholder: "홍길동", defaultValue: "" },
            { label: "사업자등록번호", placeholder: "000-00-00000", defaultValue: "" },
            { label: "주소", placeholder: "서울시 강남구...", defaultValue: "" },
            { label: "고객센터 전화", placeholder: "1588-0000", defaultValue: "" },
            { label: "이메일", placeholder: "cs@company.com", defaultValue: "" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              <input type="text" placeholder={f.placeholder} className="input-base" />
            </div>
          ))}
          <button className="btn-gold flex items-center gap-2 text-sm mt-2">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {/* 정산 설정 */}
      {tab === "settlement" && (
        <div className="card-elevated space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">정산 운영 설정</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "정산 기준일", placeholder: "25", desc: "매월 몇 일에 마감할지" },
              { label: "지급일", placeholder: "10", desc: "익월 몇 일에 지급할지" },
              { label: "원천징수 세율 (%)", placeholder: "3.3", desc: "기본 3.3%" },
              { label: "최소 지급액 (원)", placeholder: "10000", desc: "미달 시 이월" },
              { label: "수당 지급 최대 단계", placeholder: "2", desc: "공유수당형은 2단계" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs text-text-muted mb-1">{f.label}</label>
                <input type="text" placeholder={f.placeholder} className="input-base text-sm" />
                <p className="text-[11px] text-text-muted mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
          <button className="btn-gold flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {/* 직급 설정 */}
      {tab === "rank" && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">직급 체계</h3>
            <button className="text-xs text-gold hover:text-gold-light transition-colors">+ 직급 추가</button>
          </div>
          <div className="space-y-3">
            {RANKS.map((r) => (
              <div key={r.code} className="flex items-center gap-4 p-3 bg-bg rounded-xl border border-bg-border">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <p className="text-text-muted mb-1">직급명</p>
                    <input defaultValue={r.name} className="input-base text-xs py-1.5" />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">최소 개인PV</p>
                    <input type="number" defaultValue={r.min_pv} className="input-base text-xs py-1.5" />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">최소 그룹GV</p>
                    <input type="number" defaultValue={r.min_gv} className="input-base text-xs py-1.5" />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">직추천 최소</p>
                    <input type="number" defaultValue={r.min_direct} className="input-base text-xs py-1.5" />
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">색상</p>
                    <input type="color" defaultValue={r.color} className="w-full h-8 bg-bg border border-bg-border rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-gold flex items-center gap-2 text-sm mt-4">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {/* 결제 설정 */}
      {tab === "payment" && (
        <div className="card-elevated space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">결제 수단 설정</h3>
          {[
            { label: "PG사 선택", type: "select", options: ["KG이니시스", "토스페이먼츠", "나이스페이", "직접입금(무통장)"] },
            { label: "PG 상점 ID", type: "text", placeholder: "INIpayTest" },
            { label: "PG API Key", type: "password", placeholder: "••••••••••••••••" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              {f.type === "select" ? (
                <select className="input-base">
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} placeholder={f.placeholder} className="input-base" />
              )}
            </div>
          ))}
          <button className="btn-gold flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}
    </div>
  );
}
