"use client";

import { useState } from "react";
import {
  Plus,
  Calculator,
  Layers,
  GitBranch,
  Grid3X3,
  Shuffle,
  Shield,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit3,
  Save,

  Play,

} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommissionType } from "@/types";

const PLAN_TYPES: { type: CommissionType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: "UNILEVEL", label: "유니레벨", icon: Layers, desc: "무제한 폭, 깊이 제한 수당" },
  { type: "BINARY", label: "바이너리", icon: GitBranch, desc: "좌/우 2라인 매칭 수당" },
  { type: "MATRIX", label: "매트릭스", icon: Grid3X3, desc: "폭×깊이 고정 구조 수당" },
  { type: "HYBRID", label: "혼합형", icon: Shuffle, desc: "두 가지 이상 구조 결합" },
  { type: "SHARED", label: "공유수당형", icon: Shield, desc: "2단계 수당 + 볼륨 구조 (법적 안전)" },
];

const RULE_TYPES = [
  { value: "REFERRAL", label: "추천수당", desc: "직접 추천한 회원의 구매에 대한 수당" },
  { value: "TEAM", label: "팀수당", desc: "하위 네트워크 매출에 대한 수당" },
  { value: "RANK_BONUS", label: "직급수당", desc: "직급에 따른 추가 보너스" },
  { value: "MATCHING", label: "매칭수당", desc: "상위자가 하위자 수당의 일정 % 수령" },
  { value: "VOLUME", label: "볼륨(승급용)", desc: "수당 없이 직급 승급에만 사용되는 볼륨" },
];

interface Rule {
  id: string;
  name: string;
  rule_type: string;
  target_depth_from: number;
  target_depth_to: number;
  target_side: string;
  calc_type: string;
  value: number;
  base: string;
  min_rank_level: number;
  min_personal_pv: number;
  is_volume_only: boolean;
  max_amount: number | null;
  is_active: boolean;
}

const DEMO_RULES: Rule[] = [
  {
    id: "1",
    name: "직접추천수당",
    rule_type: "REFERRAL",
    target_depth_from: 1,
    target_depth_to: 1,
    target_side: "ALL",
    calc_type: "PERCENT",
    value: 10,
    base: "BV",
    min_rank_level: 0,
    min_personal_pv: 0,
    is_volume_only: false,
    max_amount: null,
    is_active: true,
  },
  {
    id: "2",
    name: "간접수당 (2단계)",
    rule_type: "TEAM",
    target_depth_from: 2,
    target_depth_to: 2,
    target_side: "ALL",
    calc_type: "PERCENT",
    value: 5,
    base: "BV",
    min_rank_level: 1,
    min_personal_pv: 100,
    is_volume_only: false,
    max_amount: null,
    is_active: true,
  },
  {
    id: "3",
    name: "볼륨 (3단계 이하)",
    rule_type: "VOLUME",
    target_depth_from: 3,
    target_depth_to: 0,
    target_side: "ALL",
    calc_type: "PERCENT",
    value: 0,
    base: "BV",
    min_rank_level: 0,
    min_personal_pv: 0,
    is_volume_only: true,
    max_amount: null,
    is_active: true,
  },
];

export default function PlanPage() {
  const [selectedType, setSelectedType] = useState<CommissionType>("SHARED");
  const [planName, setPlanName] = useState("공유수당 플랜 v1");
  const [rules, setRules] = useState<Rule[]>(DEMO_RULES);
  const [expandedRule, setExpandedRule] = useState<string | null>("1");
  const [showAddRule, setShowAddRule] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">수당 플랜 설정</h1>
          <p className="text-text-muted text-sm mt-0.5">플랜 구조와 수당 규칙을 정의합니다</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2 text-sm">
            <Play className="w-4 h-4" />
            시뮬레이션
          </button>
          <button className="btn-gold flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>

      {/* 플랜 기본 정보 */}
      <div className="card-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-4">플랜 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">플랜명</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">플랜 유형</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLAN_TYPES.map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                    selectedType === pt.type
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-bg-border text-text-secondary hover:border-gold/20 hover:text-text-primary"
                  )}
                >
                  <pt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 선택된 플랜 타입 설명 */}
        {selectedType === "SHARED" && (
          <div className="mt-4 flex items-start gap-2.5 bg-gold/5 border border-gold/15 rounded-lg px-4 py-3">
            <Shield className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gold">공유수당형 선택됨</p>
              <p className="text-xs text-text-muted mt-0.5">
                수당은 1~2단계까지만 지급되며, 3단계 이하는 직급 승급용 볼륨으로만 집계됩니다.
                다단계판매업 등록 없이 운영 가능한 구조입니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 수당 규칙 목록 */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">수당 규칙</h3>
          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            규칙 추가
          </button>
        </div>

        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className={cn(
                "border rounded-xl overflow-hidden transition-all",
                expandedRule === rule.id ? "border-gold/25" : "border-bg-border"
              )}
            >
              {/* 규칙 헤더 */}
              <button
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-elevated/50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-xs text-text-muted flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 flex items-center gap-3 min-w-0 text-left">
                  <span className="text-sm font-medium text-text-primary">{rule.name}</span>
                  <span className={cn("badge text-[10px]", rule.is_volume_only ? "badge-gray" : "badge-gold")}>
                    {rule.is_volume_only ? "볼륨전용" : `${rule.value}%`}
                  </span>
                  <span className="text-xs text-text-muted">
                    {rule.target_depth_from}
                    {rule.target_depth_to === 0
                      ? "단계~무제한"
                      : rule.target_depth_from === rule.target_depth_to
                      ? "단계"
                      : `~${rule.target_depth_to}단계`}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      rule.is_active ? "bg-emerald-soft" : "bg-bg-border"
                    )}
                  />
                  {expandedRule === rule.id ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </button>

              {/* 규칙 상세 설정 */}
              {expandedRule === rule.id && (
                <div className="px-4 pb-4 pt-1 border-t border-bg-border bg-bg/50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">규칙 유형</label>
                      <select className="input-base text-sm py-2">
                        {RULE_TYPES.map((rt) => (
                          <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">시작 단계</label>
                      <input type="number" defaultValue={rule.target_depth_from} min={1} className="input-base text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">종료 단계 (0=무제한)</label>
                      <input type="number" defaultValue={rule.target_depth_to} min={0} className="input-base text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">계산 방식</label>
                      <select className="input-base text-sm py-2" defaultValue={rule.calc_type}>
                        <option value="PERCENT">비율 (%)</option>
                        <option value="FIXED">고정금액 (원)</option>
                        <option value="TIER">직급별 차등</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">
                        {rule.calc_type === "PERCENT" ? "비율 (%)" : "금액 (원)"}
                      </label>
                      <input type="number" defaultValue={rule.value} step={0.1} className="input-base text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">계산 기준</label>
                      <select className="input-base text-sm py-2" defaultValue={rule.base}>
                        <option value="BV">BV (수당가)</option>
                        <option value="PV">PV (포인트)</option>
                        <option value="PRICE">판매가</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">최소 자격 직급 레벨</label>
                      <input type="number" defaultValue={rule.min_rank_level} min={0} className="input-base text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">최소 개인 PV</label>
                      <input type="number" defaultValue={rule.min_personal_pv} min={0} className="input-base text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1.5">회당 최대 수당 (원, 0=무제한)</label>
                      <input type="number" defaultValue={rule.max_amount ?? 0} min={0} className="input-base text-sm py-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-bg-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className={cn(
                          "w-10 h-5 rounded-full border transition-colors relative",
                          rule.is_volume_only ? "bg-gold/20 border-gold/30" : "bg-bg-border border-bg-border"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full transition-transform",
                            rule.is_volume_only ? "translate-x-5 bg-gold" : "translate-x-0.5 bg-text-muted"
                          )}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">볼륨 전용 (수당 미지급, 직급 승급에만 사용)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </button>
                      <button className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 규칙 추가 버튼 */}
        <button
          onClick={() => setShowAddRule(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 border border-dashed border-bg-border rounded-xl text-text-muted hover:border-gold/30 hover:text-gold transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          수당 규칙 추가
        </button>
      </div>

      {/* 직급 설정 미리보기 */}
      <div className="card-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-4">수당 구조 요약</h3>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>규칙명</th>
                <th>대상 단계</th>
                <th>비율/금액</th>
                <th>기준</th>
                <th>자격 조건</th>
                <th>유형</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="font-medium">{rule.name}</td>
                  <td>
                    {rule.target_depth_from}
                    {rule.target_depth_to === 0
                      ? "단계~∞"
                      : rule.target_depth_from === rule.target_depth_to
                      ? "단계"
                      : `~${rule.target_depth_to}단계`}
                  </td>
                  <td>{rule.is_volume_only ? "—" : `${rule.value}${rule.calc_type === "PERCENT" ? "%" : "원"}`}</td>
                  <td>{rule.base}</td>
                  <td>
                    <span className="text-text-muted text-xs">
                      PV {rule.min_personal_pv}+ / Lv.{rule.min_rank_level}+
                    </span>
                  </td>
                  <td>
                    <span className={cn("badge text-[10px]", rule.is_volume_only ? "badge-gray" : "badge-gold")}>
                      {rule.is_volume_only ? "볼륨" : "수당"}
                    </span>
                  </td>
                  <td>
                    <span className={cn("w-2 h-2 rounded-full inline-block", rule.is_active ? "bg-emerald-soft" : "bg-bg-border")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
