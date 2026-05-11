"use client";

import { useState } from "react";
import { Search, Users, GitBranch, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";

interface Node {
  id: string;
  code: string;
  name: string;
  rank: string;
  pv: number;
  gv: number;
  direct: number;
  children?: Node[];
}

const TREE: Node = {
  id: "0", code: "M-000001", name: "최상위관리자", rank: "다이아", pv: 2400, gv: 124000, direct: 2,
  children: [
    {
      id: "1", code: "M-000012", name: "이영희", rank: "골드", pv: 1200, gv: 32400, direct: 3,
      children: [
        {
          id: "3", code: "M-012847", name: "김민수", rank: "골드", pv: 850, gv: 12400, direct: 2,
          children: [
            { id: "6", code: "M-012845", name: "이준호", rank: "일반", pv: 120, gv: 820, direct: 0 },
            { id: "7", code: "M-012844", name: "정수아", rank: "일반", pv: 0,   gv: 0,   direct: 0 },
          ],
        },
        {
          id: "4", code: "M-012842", name: "오민정", rank: "골드", pv: 920, gv: 18600, direct: 1,
          children: [
            { id: "8", code: "M-012841", name: "강동현", rank: "일반", pv: 80, gv: 240, direct: 0 },
          ],
        },
        { id: "9", code: "M-012839", name: "임채원", rank: "실버", pv: 280, gv: 1200, direct: 0 },
      ],
    },
    {
      id: "2", code: "M-000089", name: "최강산", rank: "플래티넘", pv: 1800, gv: 68200, direct: 2,
      children: [
        {
          id: "5", code: "M-012846", name: "박지현", rank: "실버", pv: 320, gv: 4800, direct: 1,
          children: [
            { id: "10", code: "M-012843", name: "한상욱", rank: "실버", pv: 450, gv: 3200, direct: 0 },
          ],
        },
        { id: "11", code: "M-012830", name: "신동호", rank: "골드", pv: 680, gv: 9400, direct: 0 },
      ],
    },
  ],
};

const RANK_COLOR: Record<string, { color: string; bg: string }> = {
  다이아:   { color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  플래티넘: { color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  골드:     { color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  실버:     { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  일반:     { color: "#444466", bg: "rgba(68,68,102,0.12)" },
};

function countAll(node: Node): number {
  if (!node.children?.length) return 1;
  return 1 + node.children.reduce((s, c) => s + countAll(c), 0);
}

function maxDepth(node: Node, d = 0): number {
  if (!node.children?.length) return d;
  return Math.max(...node.children.map(c => maxDepth(c, d + 1)));
}

function TreeNode({ node, depth = 0, search }: { node: Node; depth?: number; search: string }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = !!node.children?.length;
  const rc = RANK_COLOR[node.rank] || RANK_COLOR["일반"];
  const matchSearch = !search || node.name.includes(search) || node.code.includes(search);

  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "9px 12px", borderRadius: "10px",
          paddingLeft: `${depth * 22 + 12}px`,
          background: depth === 0 ? "rgba(201,168,76,0.05)" : "transparent",
          border: depth === 0 ? "1px solid rgba(201,168,76,0.1)" : "1px solid transparent",
          transition: "background 0.15s",
          opacity: search && !matchSearch ? 0.3 : 1,
        }}
        onMouseEnter={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.04)"; }}
        onMouseLeave={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {/* 토글 */}
        <button onClick={() => setOpen(!open)} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", color: "var(--text-muted)", flexShrink: 0 }}>
          {hasChildren
            ? open ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bg-border)", display: "inline-block" }} />
          }
        </button>

        {/* 아바타 */}
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rc.bg, border: `1.5px solid ${rc.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: rc.color, flexShrink: 0 }}>
          {node.name[0]}
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{node.name}</span>
              <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: rc.bg, color: rc.color }}>{node.rank}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{node.code}</p>
          </div>
          <div className="hidden sm:flex" style={{ gap: "14px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>PV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.pv.toLocaleString()}</span></span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>GV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.gv.toLocaleString()}</span></span>
            {hasChildren && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>하위 <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.direct}명</span></span>}
          </div>
        </div>
      </div>

      {hasChildren && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth * 22 + 22}px` }} />
          {node.children!.map(c => <TreeNode key={c.id} node={c} depth={depth + 1} search={search} />)}
        </div>
      )}
    </div>
  );
}

export default function OrgPage() {
  const [search, setSearch] = useState("");
  const totalMembers = countAll(TREE) - 1;
  const depth = maxDepth(TREE);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>조직도</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>전체 추천 네트워크 구조</p>
        </div>
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="회원명, 번호 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px" }} />
        </div>
      </div>

      {/* 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
        {[
          { label: "전체 회원", value: `${totalMembers.toLocaleString()}명`, icon: Users, color: "var(--gold)" },
          { label: "최대 깊이", value: `${depth}단계`, icon: GitBranch, color: "#4F8EF7" },
          { label: "직추천 평균", value: "3.2명", icon: TrendingUp, color: "var(--emerald)" },
          { label: "이번달 신규", value: "23명", icon: Users, color: "#A78BFA" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={16} color={s.color} />
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 트리 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "14px", overflowY: "auto" }}>
        <TreeNode node={TREE} search={search} />
      </div>
    </div>
  );
}
