"use client";

import { useState, useEffect } from "react";
import { Search, Users, GitBranch, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface TreeMember {
  id: string;
  member_code: string;
  name: string;
  rank: string;
  rank_color: string;
  personal_pv: number;
  group_gv: number;
  isSelf?: boolean;
  children?: TreeMember[];
}

function TreeNode({ node, depth = 0 }: { node: TreeMember; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const has = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 12px",
        paddingLeft: `${depth * 18 + 12}px`,
        borderRadius: "10px",
        background: node.isSelf ? "rgba(201,168,76,0.06)" : "transparent",
        border: node.isSelf ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
        transition: "background 0.15s", marginBottom: "2px",
      }}>
        <button onClick={() => setOpen(!open)} style={{
          width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: has ? "pointer" : "default",
          color: "var(--text-muted)", flexShrink: 0,
        }}>
          {has ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) :
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--bg-border)", display: "inline-block" }} />}
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: `${node.rank_color}22`, border: `1.5px solid ${node.rank_color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", fontWeight: 700, color: node.rank_color, flexShrink: 0,
        }}>{node.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              {node.name}{node.isSelf ? " (나)" : ""}
            </span>
            <span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: `${node.rank_color}22`, color: node.rank_color }}>
              {node.rank}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "1px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>PV <strong style={{ color: "var(--text-secondary)" }}>{node.personal_pv}</strong></span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>GV <strong style={{ color: "var(--text-secondary)" }}>{node.group_gv.toLocaleString()}</strong></span>
          </div>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "monospace", flexShrink: 0, display: "none" }} className="sm:block">
          {node.member_code}
        </span>
      </div>
      {has && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth * 18 + 21}px` }} />
          {node.children!.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function NetworkPage() {
  const [search, setSearch] = useState("");
  const [tree, setTree] = useState<TreeMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ direct: 0, total: 0, gv: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // 본인 데이터
      const { data: me } = await supabase
        .from("members")
        .select("id, member_code, name, personal_pv, group_gv, rank:ranks(name, color)")
        .eq("id", session.user.id).single();

      // member_paths로 전체 하위 가져오기
      const { data: paths } = await supabase
        .from("member_paths")
        .select("descendant_id, depth")
        .eq("ancestor_id", session.user.id)
        .gt("depth", 0)
        .order("depth", { ascending: true });

      if (!paths || paths.length === 0) {
        const meRank = (me as any)?.rank;
        setTree({
          id: session.user.id,
          member_code: (me as any)?.member_code ?? "",
          name: me?.name ?? "나",
          rank: meRank?.name ?? "파트너",
          rank_color: meRank?.color ?? "#C9A84C",
          personal_pv: me?.personal_pv ?? 0,
          group_gv: me?.group_gv ?? 0,
          isSelf: true,
          children: [],
        });
        setStats({ direct: 0, total: 0, gv: me?.group_gv ?? 0 });
        setLoading(false);
        return;
      }

      const descendantIds = paths.map((p: any) => p.descendant_id);
      const { data: members } = await supabase
        .from("members")
        .select("id, member_code, name, personal_pv, group_gv, sponsor_id, rank:ranks(name, color)")
        .in("id", descendantIds);

      // 트리 빌드
      const memberMap: Record<string, TreeMember> = {};
      (members ?? []).forEach((m: any) => {
        memberMap[m.id] = {
          id: m.id, member_code: m.member_code, name: m.name,
          rank: m.rank?.name ?? "파트너", rank_color: m.rank?.color ?? "#94A3B8",
          personal_pv: m.personal_pv, group_gv: m.group_gv,
          children: [],
        };
      });

      const meRank = (me as any)?.rank;
      const root: TreeMember = {
        id: session.user.id,
        member_code: (me as any)?.member_code ?? "",
        name: me?.name ?? "나",
        rank: meRank?.name ?? "파트너", rank_color: meRank?.color ?? "#C9A84C",
        personal_pv: me?.personal_pv ?? 0, group_gv: me?.group_gv ?? 0,
        isSelf: true, children: [],
      };

      (members ?? []).forEach((m: any) => {
        if (m.sponsor_id === session.user.id) {
          root.children!.push(memberMap[m.id]);
        } else if (memberMap[m.sponsor_id]) {
          memberMap[m.sponsor_id].children!.push(memberMap[m.id]);
        }
      });

      const directCount = (members ?? []).filter((m: any) => m.sponsor_id === session.user.id).length;
      setTree(root);
      setStats({ direct: directCount, total: descendantIds.length, gv: me?.group_gv ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  // 검색 필터 (이름)
  const filterTree = (node: TreeMember, q: string): TreeMember | null => {
    if (!q) return node;
    const childResults = node.children?.map(c => filterTree(c, q)).filter(Boolean) as TreeMember[];
    if (node.name.includes(q) || node.isSelf) return { ...node, children: childResults };
    if (childResults.length > 0) return { ...node, children: childResults };
    return null;
  };

  const displayTree = tree && search ? filterTree(tree, search) : tree;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>내 조직</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>나의 추천 네트워크</p>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="회원명 검색..." className="input-base"
            style={{ paddingLeft: "30px", fontSize: "13px", width: "180px" }}
          />
        </div>
      </div>

      {/* 현황 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
        {[
          { label: "직접 추천", value: `${stats.direct}명`, icon: Users, color: "var(--gold)" },
          { label: "전체 하위", value: `${stats.total}명`, icon: GitBranch, color: "#4F8EF7" },
          { label: "그룹 GV", value: stats.gv.toLocaleString(), icon: TrendingUp, color: "var(--emerald)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <s.icon size={18} color={s.color} />
            <div>
              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.label}</p>
              <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 트리 */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "12px" }}>
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
        ) : displayTree ? (
          <TreeNode node={displayTree} />
        ) : (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            {search ? "검색 결과가 없습니다" : "하위 조직이 없습니다"}
          </div>
        )}
      </div>
    </div>
  );
}
