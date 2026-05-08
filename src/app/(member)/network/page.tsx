"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MY_TREE = {
  id: "me", code: "M-012847", name: "김민수 (나)", rank: "골드", pv: 850, gv: 12400, isSelf: true,
  children: [
    {
      id: "c1", code: "M-012845", name: "이준호", rank: "일반", pv: 120, gv: 820,
      children: [
        { id: "c3", code: "M-012844", name: "정수아", rank: "일반", pv: 0, gv: 0 },
        { id: "c4", code: "M-012838", name: "서민아", rank: "일반", pv: 60, gv: 60 },
      ],
    },
    {
      id: "c2", code: "M-012843", name: "한상욱", rank: "실버", pv: 450, gv: 3200,
      children: [
        { id: "c5", code: "M-012841", name: "강동현", rank: "일반", pv: 80, gv: 240 },
      ],
    },
    { id: "c6", code: "M-012836", name: "임채원", rank: "일반", pv: 0, gv: 0 },
  ],
};

const RANK_COLOR: Record<string, string> = {
  골드: "text-gold bg-gold/10 border-gold/20",
  실버: "text-slate-300 bg-slate-500/10 border-slate-400/20",
  일반: "text-text-muted bg-bg-elevated border-bg-border",
};

function Node({ node, depth = 0 }: { node: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children?.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-colors",
          node.isSelf ? "bg-gold/8 border border-gold/15" : "hover:bg-bg-elevated/50"
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        <button onClick={() => setOpen(!open)} className="w-5 h-5 flex items-center justify-center text-text-muted flex-shrink-0">
          {hasChildren ? (
            open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : <span className="w-1.5 h-1.5 rounded-full bg-bg-border" />}
        </button>
        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-xs flex-shrink-0">
          {node.name[0]}
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div>
            <p className="text-sm font-medium text-text-primary">{node.name}</p>
            <p className="text-[11px] text-text-muted font-mono">{node.code}</p>
          </div>
          <span className={cn("text-[10px] border rounded-full px-2 py-0.5 ml-1", RANK_COLOR[node.rank])}>
            {node.rank}
          </span>
          <div className="hidden sm:flex gap-3 ml-2 text-xs text-text-muted">
            <span>PV <span className="text-text-secondary">{node.pv}</span></span>
            <span>GV <span className="text-text-secondary">{node.gv.toLocaleString()}</span></span>
          </div>
        </div>
      </div>
      {hasChildren && open && (
        <div className="relative">
          <div className="absolute top-0 bottom-0 border-l border-bg-border" style={{ left: `${depth * 20 + 20}px` }} />
          {node.children.map((c: any) => <Node key={c.id} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function MemberOrgPage() {
  const totalDownline = 6;
  const directCount = MY_TREE.children?.length || 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary">내 조직</h2>
        <p className="text-text-muted text-sm mt-0.5">나의 추천 네트워크 현황</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "직추천", value: `${directCount}명` },
          { label: "전체 하위", value: `${totalDownline}명` },
          { label: "내 GV", value: "12,400" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-xs text-text-muted mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gold font-display">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <Node node={MY_TREE} />
      </div>
    </div>
  );
}
