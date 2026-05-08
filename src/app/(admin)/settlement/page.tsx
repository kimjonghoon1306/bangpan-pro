"use client";

import { useState } from "react";
import {
  Calculator,
  Play,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  Wallet,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn, formatKRW } from "@/lib/utils";

const PERIODS = [
  { id: "1", year: 2024, month: 7, status: "OPEN", total_bv: 284200, total_commission: 38420000 },
  { id: "2", year: 2024, month: 6, status: "PAID", total_bv: 261800, total_commission: 35180000 },
  { id: "3", year: 2024, month: 5, status: "PAID", total_bv: 248400, total_commission: 33240000 },
  { id: "4", year: 2024, month: 4, status: "PAID", total_bv: 239600, total_commission: 31840000 },
];

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  OPEN: { label: "진행중", cls: "badge-gold", icon: Clock },
  CALCULATING: { label: "계산중", cls: "text-blue-300 bg-blue-500/10 border border-blue-400/20", icon: Calculator },
  CLOSED: { label: "확정", cls: "badge-green", icon: CheckCircle },
  PAID: { label: "지급완료", cls: "badge-gray", icon: CheckCircle },
};

const DEMO_COMMISSIONS = [
  { member: "김민수", code: "M-012847", rule: "직접추천수당", depth: 1, base: 850000, rate: 10, amount: 85000 },
  { member: "박지현", code: "M-012846", rule: "직접추천수당", depth: 1, base: 320000, rate: 10, amount: 32000 },
  { member: "김민수", code: "M-012847", rule: "간접수당", depth: 2, base: 320000, rate: 5, amount: 16000 },
  { member: "오민정", code: "M-012842", rule: "직접추천수당", depth: 1, base: 920000, rate: 10, amount: 92000 },
  { member: "한상욱", code: "M-012843", rule: "간접수당", depth: 2, base: 450000, rate: 5, amount: 22500 },
];

export default function CommissionPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [calculating, setCalculating] = useState(false);

  function handleCalculate() {
    setCalculating(true);
    setTimeout(() => setCalculating(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">정산 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">수당 계산 및 지급 처리</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            지급명세서
          </button>
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="btn-gold flex items-center gap-2 text-sm"
          >
            {calculating ? (
              <>
                <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                계산중...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                수당 계산 실행
              </>
            )}
          </button>
        </div>
      </div>

      {/* 정산 기간 선택 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PERIODS.map((p) => {
          const S = STATUS_MAP[p.status];
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p)}
              className={cn(
                "card-elevated text-left transition-all hover:border-gold/25",
                selectedPeriod.id === p.id && "border-gold/30 bg-gold/5"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-base font-bold text-text-primary">
                  {p.year}.{String(p.month).padStart(2, "0")}
                </span>
                <span className={cn("badge text-[10px]", S.cls)}>{S.label}</span>
              </div>
              <p className="text-xs text-text-muted">총 BV {p.total_bv.toLocaleString()}</p>
              <p className="text-sm font-semibold text-gold mt-0.5">
                {formatKRW(p.total_commission)}
              </p>
            </button>
          );
        })}
      </div>

      {/* 선택된 기간 상세 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-xs text-text-muted">총 수당</p>
            <p className="text-lg font-bold text-gold font-display">
              {formatKRW(selectedPeriod.total_commission)}
            </p>
          </div>
        </div>
        <div className="card-elevated flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-soft/10 border border-emerald-soft/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-soft" />
          </div>
          <div>
            <p className="text-xs text-text-muted">총 BV</p>
            <p className="text-lg font-bold text-text-primary font-display">
              {selectedPeriod.total_bv.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card-elevated flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-text-muted">수당 대상자</p>
            <p className="text-lg font-bold text-text-primary font-display">
              {DEMO_COMMISSIONS.length}명
            </p>
          </div>
        </div>
      </div>

      {/* 세금 계산 안내 */}
      <div className="flex items-start gap-3 bg-bg-elevated border border-bg-border rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
        <div className="text-xs text-text-muted">
          <span className="text-text-secondary font-medium">원천징수 3.3% 자동 적용.</span>
          {" "}총 수당 {formatKRW(selectedPeriod.total_commission)}에서 세금 {formatKRW(Math.floor(selectedPeriod.total_commission * 0.033))}를 공제한{" "}
          <span className="text-gold font-medium">{formatKRW(Math.floor(selectedPeriod.total_commission * 0.967))}</span>이 실지급됩니다.
        </div>
      </div>

      {/* 수당 내역 테이블 */}
      <div className="card-elevated p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">수당 상세 내역</h3>
          <span className="text-xs text-text-muted">{DEMO_COMMISSIONS.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>회원</th>
                <th>규칙</th>
                <th>단계</th>
                <th>기준 금액</th>
                <th>비율</th>
                <th>수당액</th>
                <th>세후</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_COMMISSIONS.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.member}</p>
                      <p className="text-[11px] text-text-muted font-mono">{c.code}</p>
                    </div>
                  </td>
                  <td className="text-sm text-text-secondary">{c.rule}</td>
                  <td>
                    <span className="badge-gray badge text-[10px]">{c.depth}단계</span>
                  </td>
                  <td className="text-sm text-text-secondary">{c.base.toLocaleString()}원</td>
                  <td className="text-sm text-gold">{c.rate}%</td>
                  <td className="text-sm font-medium text-text-primary">{c.amount.toLocaleString()}원</td>
                  <td className="text-sm text-emerald-soft">
                    {Math.floor(c.amount * 0.967).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 지급 처리 버튼 */}
      {selectedPeriod.status === "OPEN" && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-emerald-soft/10 border border-emerald-soft/25 text-emerald-soft px-5 py-2.5 rounded-lg hover:bg-emerald-soft/20 transition-all text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            정산 확정 및 지급 처리
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
