"use client";

import { useState, useEffect } from "react";
import { Search, Users, GitBranch, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface Node { id: string; code: string; name: string; rank: string; rankColor: string; pv: number; gv: number; children?: Node[]; }

function countAll(node: Node): number { return 1 + (node.children?.reduce((s, c) => s + countAll(c), 0) ?? 0); }
function maxDepth(node: Node, d = 0): number { if (!node.children?.length) return d; return Math.max(...node.children.map(c => maxDepth(c, d+1))); }

function TreeNode({ node, depth = 0, search }: { node: Node; depth?: number; search: string }) {
  const [open, setOpen] = useState(depth < 2);
  const has = !!node.children?.length;
  const match = !search || node.name.includes(search) || node.code.includes(search);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", paddingLeft: `${depth*22+12}px`, background: depth === 0 ? "rgba(201,168,76,0.05)" : "transparent", border: depth === 0 ? "1px solid rgba(201,168,76,0.1)" : "1px solid transparent", transition: "background 0.15s", opacity: search && !match ? 0.3 : 1 }}
        onMouseEnter={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.04)"; }}
        onMouseLeave={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <button onClick={() => setOpen(!open)} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: has ? "pointer" : "default", color: "var(--text-muted)", flexShrink: 0 }}>
          {has ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bg-border)", display: "inline-block" }} />}
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${node.rankColor}22`, border: `1.5px solid ${node.rankColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: node.rankColor, flexShrink: 0 }}>{node.name[0]}</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{node.name}</span>
              <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: `${node.rankColor}22`, color: node.rankColor }}>{node.rank}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{node.code}</p>
          </div>
          <div className="hidden sm:flex" style={{ gap: "14px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>PV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.pv.toLocaleString()}</span></span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>GV <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{node.gv.toLocaleString()}</span></span>
          </div>
        </div>
      </div>
      {has && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth*22+22}px` }} />
          {node.children!.map(c => <TreeNode key={c.id} node={c} depth={depth+1} search={search} />)}
        </div>
      )}
    </div>
  );
}

export default function OrgPage() {
  const [search, setSearch] = useState("");
  const [tree, setTree] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, depth: 0, newThisMonth: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: members } = await supabase.from("members").select("id, member_code, name, sponsor_id, personal_pv, group_gv, rank:ranks(name, color)").eq("is_admin", false).order("created_at");

      if (!members?.length) { setLoading(false); return; }

      // 루트 찾기 (sponsor_id가 없거나 다른 회원 sponsor_id가 없는 최상위)
      const memberIds = new Set(members.map((m: any) => m.id));
      const roots = members.filter((m: any) => !m.sponsor_id || !memberIds.has(m.sponsor_id));

      const buildNode = (m: any): Node => ({
        id: m.id, code: m.member_code, name: m.name,
        rank: m.rank?.name ?? "파트너", rankColor: m.rank?.color ?? "#6A6A8A",
        pv: m.personal_pv, gv: m.group_gv,
        children: members.filter((c: any) => c.sponsor_id === m.id).map(buildNode),
      });

      const rootNode = roots.length === 1 ? buildNode(roots[0]) : {
        id: "root", code: "—", name: "전체 조직", rank: "—", rankColor: "#C9A84C", pv: 0, gv: 0,
        children: roots.map(buildNode),
      };

      setTree(rootNode);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: newCount } = await supabase.from("members").select("*", { count: "exact", head: true }).eq("is_admin", false).gte("created_at", monthStart);
      setStats({ total: members.length, depth: maxDepth(rootNode), newThisMonth: newCount ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>조직도</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>전체 추천 네트워크 구조</p>
        </div>
        <div style={{ position: "relative", width: "220px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="회원명, 번호 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
        {[
          { label: "전체 회원", value: `${stats.total}명`, icon: Users, color: "var(--gold)" },
          { label: "최대 깊이", value: `${stats.depth}단계`, icon: GitBranch, color: "#4F8EF7" },
          { label: "이번달 신규", value: `${stats.newThisMonth}명`, icon: TrendingUp, color: "var(--emerald)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={16} color={s.color} />
            <div><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p><p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p></div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "14px" }}>
        {loading ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
          : tree ? <TreeNode node={tree} search={search} />
          : <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>등록된 회원이 없습니다</div>}
      </div>
    </div>
  );
}
