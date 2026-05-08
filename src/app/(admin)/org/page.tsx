"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Users, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  code: string;
  name: string;
  rank: string;
  rank_level: number;
  pv: number;
  gv: number;
  children?: TreeNode[];
  expanded?: boolean;
}

const TREE: TreeNode = {
  id: "1", code: "M-000001", name: "최상위관리자", rank: "다이아", rank_level: 5, pv: 2400, gv: 84200,
  children: [
    {
      id: "2", code: "M-000012", name: "이영희", rank: "골드", rank_level: 3, pv: 1200, gv: 32400,
      children: [
        {
          id: "3", code: "M-012847", name: "김민수", rank: "골드", rank_level: 3, pv: 850, gv: 12400,
          children: [
            { id: "6", code: "M-012845", name: "이준호", rank: "일반", rank_level: 1, pv: 120, gv: 820 },
            { id: "7", code: "M-012844", name: "정수아", rank: "일반", rank_level: 1, pv: 0, gv: 0 },
          ],
        },
        {
          id: "4", code: "M-012842", name: "오민정", rank: "골드", rank_level: 3, pv: 920, gv: 18600,
          children: [
            { id: "8", code: "M-012841", name: "강동현", rank: "일반", rank_level: 1, pv: 80, gv: 240 },
          ],
        },
      ],
    },
    {
      id: "5", code: "M-000089", name: "최강산", rank: "실버", rank_level: 2, pv: 480, gv: 9800,
      children: [
        { id: "9", code: "M-012846", name: "박지현", rank: "실버", rank_level: 2, pv: 320, gv: 4800 },
        { id: "10", code: "M-012843", name: "한상욱", rank: "실버", rank_level: 2, pv: 450, gv: 3200 },
      ],
    },
  ],
};

const RANK_COLOR: Record<string, string> = {
  다이아: "text-blue-300 border-blue-400/30 bg-blue-500/10",
  골드: "text-gold border-gold/30 bg-gold/10",
  실버: "text-slate-300 border-slate-400/30 bg-slate-500/10",
  일반: "text-text-muted border-bg-border bg-bg-elevated",
};

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-bg-elevated/50 transition-colors group cursor-default",
          depth === 0 && "bg-gold/5 border border-gold/10"
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* 토글 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-5 h-5 flex items-center justify-center text-text-muted flex-shrink-0"
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-bg-border" />
          )}
        </button>

        {/* 아바타 */}
        <div className="w-7 h-7 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-xs text-text-secondary flex-shrink-0">
          {node.name[0]}
        </div>

        {/* 정보 */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{node.name}</span>
              <span className={cn("text-[10px] border rounded-full px-2 py-0.5", RANK_COLOR[node.rank] || RANK_COLOR["일반"])}>
                {node.rank}
              </span>
            </div>
            <p className="text-[11px] text-text-muted font-mono">{node.code}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-4">
            <span className="text-xs text-text-muted">PV <span className="text-text-secondary font-medium">{node.pv.toLocaleString()}</span></span>
            <span className="text-xs text-text-muted">GV <span className="text-text-secondary font-medium">{node.gv.toLocaleString()}</span></span>
            {hasChildren && (
              <span className="text-xs text-text-muted">하위 <span className="text-text-secondary font-medium">{node.children!.length}명</span></span>
            )}
          </div>
        </div>
      </div>

      {/* 자식 */}
      {hasChildren && expanded && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l border-bg-border"
            style={{ left: `${depth * 24 + 22}px` }}
          />
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">조직도</h1>
          <p className="text-text-muted text-sm mt-0.5">추천 계보 트리 구조</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="회원명 검색..."
              className="input-base pl-9 text-sm w-48"
            />
          </div>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 회원", value: "12,847명", icon: Users },
          { label: "최대 깊이", value: "8단계", icon: GitBranch },
          { label: "직추천 평균", value: "3.2명", icon: Users },
        ].map((s) => (
          <div key={s.label} className="card-elevated flex items-center gap-3">
            <s.icon className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-sm font-semibold text-text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 트리 */}
      <div className="card-elevated p-4">
        <TreeItem node={TREE} />
      </div>
    </div>
  );
}
