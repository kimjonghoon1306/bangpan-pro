"use client";

import { useState, useEffect } from "react";
import { Search, Users, GitBranch, TrendingUp, ChevronDown, ChevronRight, BookOpen, X } from "lucide-react";
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

// ─── 예시 조직 데이터 ────────────────────────────────
const DEMO_TREE: TreeMember = {
  id: "me", member_code: "M-DEMO", name: "나 (매니저)", rank: "매니저",
  rank_color: "#378ADD", personal_pv: 3000000, group_gv: 21550000, isSelf: true,
  children: [
    {
      id: "a", member_code: "M-A001", name: "김철수", rank: "매니저",
      rank_color: "#378ADD", personal_pv: 3000000, group_gv: 9050000,
      children: [
        {
          id: "a1", member_code: "M-A010", name: "이영희", rank: "멤버",
          rank_color: "#6B7280", personal_pv: 50000, group_gv: 50000, children: [],
        },
        {
          id: "a2", member_code: "M-A011", name: "박민준", rank: "매니저",
          rank_color: "#378ADD", personal_pv: 3000000, group_gv: 6000000,
          children: [
            { id: "a21", member_code: "M-A100", name: "최지원", rank: "멤버", rank_color: "#6B7280", personal_pv: 50000, group_gv: 50000, children: [] },
            { id: "a22", member_code: "M-A101", name: "정수현", rank: "매니저", rank_color: "#378ADD", personal_pv: 3000000, group_gv: 3000000, children: [] },
          ],
        },
      ],
    },
    {
      id: "b", member_code: "M-B001", name: "이민서", rank: "디렉터",
      rank_color: "#E8599A", personal_pv: 5000000, group_gv: 5000000, children: [],
    },
    {
      id: "c", member_code: "M-C001", name: "한도영", rank: "매니저",
      rank_color: "#378ADD", personal_pv: 3000000, group_gv: 3000000, children: [],
    },
    {
      id: "d", member_code: "M-D001", name: "윤지수", rank: "멤버",
      rank_color: "#6B7280", personal_pv: 50000, group_gv: 50000, children: [],
    },
  ],
};

const DEMO_STATS = { direct: 4, total: 9, gv: 21550000 };

const DEMO_TIPS = [
  { id: "a",  tip: "직추천 → 판권 수당 발생",     color: "#378ADD", arrow: true  },
  { id: "b",  tip: "직추천 → 판권 수당 발생",     color: "#E8599A", arrow: true  },
  { id: "a1", tip: "2단계 → 나는 수당 없음",      color: "#F87171", arrow: false },
  { id: "a2", tip: "2단계 → 나는 수당 없음",      color: "#F87171", arrow: false },
  { id: "a21",tip: "3단계 → 나는 수당 없음",      color: "#F87171", arrow: false },
  { id: "a22",tip: "3단계 → 나는 수당 없음",      color: "#F87171", arrow: false },
];

// ─── 트리 노드 컴포넌트 ──────────────────────────────
function TreeNode({ node, depth = 0, isDemo = false }: { node: TreeMember; depth?: number; isDemo?: boolean }) {
  const [open, setOpen] = useState(depth < 1);
  const has = (node.children?.length ?? 0) > 0;
  const tip = isDemo ? DEMO_TIPS.find(t => t.id === node.id) : null;

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
            {/* 데모 팁 */}
            {tip && (
              <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "9px", fontWeight: 700, background: tip.arrow ? "rgba(55,138,221,0.15)" : "rgba(248,113,113,0.12)", color: tip.color, border: `1px solid ${tip.color}33` }}>
                {tip.tip}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "1px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              창업비 <strong style={{ color: "var(--text-secondary)" }}>{node.personal_pv >= 1000000 ? `${(node.personal_pv/10000).toFixed(0)}만` : `${(node.personal_pv/10000)}만`}</strong>
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              산하GV <strong style={{ color: "var(--emerald)" }}>{node.group_gv >= 10000000 ? `${(node.group_gv/10000000).toFixed(1)}천만` : `${(node.group_gv/10000).toFixed(0)}만`}</strong>
            </span>
          </div>
        </div>
      </div>
      {has && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth * 18 + 21}px` }} />
          {node.children!.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} isDemo={isDemo} />)}
        </div>
      )}
    </div>
  );
}

// ─── 데모 모달 ──────────────────────────────────────
function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
      overflowY: "auto", padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "600px", margin: "0 auto",
        background: "var(--bg-surface)", borderRadius: "24px", padding: "20px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", fontSize: "10px", fontWeight: 800, color: "#10B981", marginBottom: "6px" }}>DEMO 예시</div>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>조직도 & 산하볼륨 예시</h2>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "3px 0 0" }}>실제 데이터가 아닌 설명용 예시입니다</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        </div>

        {/* GV 설명 */}
        <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "14px", padding: "14px 16px" }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#10B981", margin: "0 0 8px" }}>📊 산하 GV(그룹볼륨)란?</p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            나 + 내 하위 조직 전체의 창업비 합산 금액입니다.<br/>
            승급 조건에 사용되며, 팀이 클수록 GV가 높아집니다.
          </p>
        </div>

        {/* 통계 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {[
            { label: "직접 추천", value: `${DEMO_STATS.direct}명`, color: "#C9A84C", desc: "내가 직접 모집" },
            { label: "전체 하위", value: `${DEMO_STATS.total}명`, color: "#4FA3E8", desc: "모든 산하 인원" },
            { label: "산하 GV", value: "2,155만", color: "#10B981", desc: "전체 볼륨 합계" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: s.color, margin: "2px 0" }}>{s.value}</p>
              <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 색상 범례 */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { color: "#378ADD", label: "매니저" },
            { color: "#E8599A", label: "디렉터" },
            { color: "#6B7280", label: "멤버" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "999px", background: `${l.color}12`, border: `1px solid ${l.color}30` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: l.color }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "999px", background: "rgba(55,138,221,0.08)", border: "1px solid rgba(55,138,221,0.2)" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#378ADD" }}>판권 수당 발생</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "999px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#F87171" }}>나는 수당 없음</span>
          </div>
        </div>

        {/* 조직도 트리 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "12px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "10px", letterSpacing: "0.05em" }}>조직도 (예시)</p>
          <TreeNode node={DEMO_TREE} depth={0} isDemo={true} />
        </div>

        {/* 수당 흐름 설명 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px 16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px" }}>💰 수당 발생 구조</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { who: "김철수 소개 시", earn: "판권 25% = 75만원 (1회)", color: "#378ADD", sub: "관리비용: 철수 판권수익×10% (지속)" },
              { who: "이민서 소개 시", earn: "판권 25% = 125만원 (1회)", color: "#E8599A", sub: "디렉터 창업비 500만 기준" },
              { who: "한도영 소개 시", earn: "판권 25% = 75만원 (1회)", color: "#378ADD", sub: "" },
              { who: "윤지수 소개 시", earn: "판권 25% = 1.25만원 (1회)", color: "#6B7280", sub: "멤버 창업비 5만 기준" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 10px", borderRadius: "8px", background: "var(--bg)" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{r.who}</p>
                  {r.sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "2px 0 0" }}>{r.sub}</p>}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: r.color, flexShrink: 0, marginLeft: "8px" }}>{r.earn}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <p style={{ fontSize: "11px", color: "#F87171", margin: 0, fontWeight: 600 }}>
              ❌ 이영희·박민준·최지원·정수현 → 나는 수당 없음 (2단계 이하)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────
export default function NetworkPage() {
  const [search, setSearch]     = useState("");
  const [tree, setTree]         = useState<TreeMember | null>(null);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState({ direct: 0, total: 0, gv: 0 });
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: me } = await supabase
        .from("members")
        .select("id, member_code, name, personal_pv, group_gv, rank:ranks(name, color)")
        .eq("id", session.user.id).single();

      const { data: paths } = await supabase
        .from("member_paths")
        .select("descendant_id, depth")
        .eq("ancestor_id", session.user.id)
        .gt("depth", 0)
        .order("depth", { ascending: true });

      if (!paths || paths.length === 0) {
        const meRank = (me as any)?.rank;
        setTree({
          id: session.user.id, member_code: (me as any)?.member_code ?? "",
          name: me?.name ?? "나", rank: meRank?.name ?? "멤버",
          rank_color: meRank?.color ?? "#6B7280",
          personal_pv: me?.personal_pv ?? 0, group_gv: me?.group_gv ?? 0,
          isSelf: true, children: [],
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

      const memberMap: Record<string, TreeMember> = {};
      (members ?? []).forEach((m: any) => {
        memberMap[m.id] = {
          id: m.id, member_code: m.member_code, name: m.name,
          rank: m.rank?.name ?? "멤버", rank_color: m.rank?.color ?? "#6B7280",
          personal_pv: m.personal_pv, group_gv: m.group_gv, children: [],
        };
      });

      const meRank = (me as any)?.rank;
      const root: TreeMember = {
        id: session.user.id, member_code: (me as any)?.member_code ?? "",
        name: me?.name ?? "나", rank: meRank?.name ?? "멤버",
        rank_color: meRank?.color ?? "#6B7280",
        personal_pv: me?.personal_pv ?? 0, group_gv: me?.group_gv ?? 0,
        isSelf: true, children: [],
      };

      (members ?? []).forEach((m: any) => {
        if (m.sponsor_id === session.user.id) root.children!.push(memberMap[m.id]);
        else if (memberMap[m.sponsor_id]) memberMap[m.sponsor_id].children!.push(memberMap[m.id]);
      });

      const directCount = (members ?? []).filter((m: any) => m.sponsor_id === session.user.id).length;
      setTree(root);
      setStats({ direct: directCount, total: descendantIds.length, gv: me?.group_gv ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* 예시 보기 버튼 */}
          <button onClick={() => setShowDemo(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
            background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.35)",
            color: "#10B981", fontSize: "12px", fontWeight: 700, transition: "all 0.2s",
          }}>
            <BookOpen size={13} /> 예시 보기
          </button>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="회원명 검색..." className="input-base"
              style={{ paddingLeft: "30px", fontSize: "13px", width: "160px" }}
            />
          </div>
        </div>
      </div>

      {/* 현황 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
        {[
          { label: "직접 추천", value: `${stats.direct}명`, icon: Users, color: "var(--gold)" },
          { label: "전체 하위", value: `${stats.total}명`, icon: GitBranch, color: "#4F8EF7" },
          { label: "그룹 GV", value: stats.gv >= 10000000 ? `${(stats.gv/10000000).toFixed(1)}천만` : stats.gv >= 10000 ? `${(stats.gv/10000).toFixed(0)}만` : stats.gv.toLocaleString(), icon: TrendingUp, color: "var(--emerald)" },
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
          <div style={{ padding: "32px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "12px" }}>
              {search ? "검색 결과가 없습니다" : "아직 하위 조직이 없습니다"}
            </p>
            {!search && (
              <button onClick={() => setShowDemo(true)} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 18px", borderRadius: "10px", cursor: "pointer",
                background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.35)",
                color: "#10B981", fontSize: "13px", fontWeight: 700,
              }}>
                <BookOpen size={14} /> 조직도 예시 보기
              </button>
            )}
          </div>
        )}
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}
