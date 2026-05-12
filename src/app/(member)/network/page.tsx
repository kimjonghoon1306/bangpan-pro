"use client";

import { useState } from "react";
import { Search, Users, GitBranch, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";

const MY_TREE = {
  id: "me", code: "M-012847", name: "김민수 (나)", rank: "골드", rankColor: "#C9A84C", pv: 850, gv: 12400, isSelf: true,
  children: [
    {
      id: "c1", code: "M-012845", name: "이준호", rank: "일반", rankColor: "#444466", pv: 120, gv: 820,
      children: [
        { id: "c3", code: "M-012844", name: "정수아", rank: "일반", rankColor: "#444466", pv: 0, gv: 0 },
        { id: "c4", code: "M-012838", name: "서민아", rank: "일반", rankColor: "#444466", pv: 60, gv: 60 },
      ],
    },
    {
      id: "c2", code: "M-012843", name: "한상욱", rank: "실버", rankColor: "#94A3B8", pv: 450, gv: 3200,
      children: [
        { id: "c5", code: "M-012841", name: "강동현", rank: "일반", rankColor: "#444466", pv: 80, gv: 240 },
      ],
    },
    { id: "c6", code: "M-012836", name: "임채원", rank: "실버", rankColor: "#94A3B8", pv: 200, gv: 800 },
  ],
};

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const has = node.children?.length > 0;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 12px",
        paddingLeft: `${depth * 20 + 12}px`,
        borderRadius: "10px",
        background: node.isSelf ? "rgba(201,168,76,0.06)" : "transparent",
        border: node.isSelf ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
        transition: "background 0.15s", marginBottom: "2px",
      }}>
        <button onClick={() => setOpen(!open)} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: has ? "pointer" : "default", color: "var(--text-muted)", flexShrink: 0 }}>
          {has ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bg-border)", display: "inline-block" }} />}
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${node.rankColor}22`, border: `1.5px solid ${node.rankColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: node.rankColor, flexShrink: 0 }}>
          {node.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{node.name}</span>
            <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: `${node.rankColor}22`, color: node.rankColor }}>{node.rank}</span>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>PV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.pv}</span></span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>GV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.gv.toLocaleString()}</span></span>
          </div>
        </div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", flexShrink: 0 }} className="hidden sm:block">{node.code}</span>
      </div>
      {has && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth * 20 + 22}px` }} />
          {node.children.map((c: any) => <TreeNode key={c.id} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function NetworkPage() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }} className="max-lg:block max-lg:space-y-4">

      {/* 좌측 — 트리 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>내 조직</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>나의 추천 네트워크</p>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="회원명 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px", width: "200px" }} />
          </div>
        </div>

        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "14px" }}>
          <TreeNode node={MY_TREE} />
        </div>
      </div>

      {/* 우측 — 요약 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "18px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>조직 현황</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "직접 추천", value: `${MY_TREE.children?.length}명`, icon: Users, color: "var(--gold)" },
              { label: "전체 하위", value: "6명", icon: GitBranch, color: "#4F8EF7" },
              { label: "내 그룹 GV", value: "12,400", icon: TrendingUp, color: "var(--emerald)" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                <s.icon size={16} color={s.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 직추천 목록 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>직접 추천 회원</h3>
          </div>
          {MY_TREE.children?.map((m: any, i: number) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: i < (MY_TREE.children?.length ?? 0)-1 ? "1px solid var(--bg-border)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${m.rankColor}22`, border: `1.5px solid ${m.rankColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: m.rankColor, flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>GV {m.gv.toLocaleString()}</p>
              </div>
              <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: `${m.rankColor}22`, color: m.rankColor }}>{m.rank}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
