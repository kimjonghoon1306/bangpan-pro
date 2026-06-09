"use client";

import { useState, useEffect } from "react";
import { Search, Users, GitBranch, TrendingUp, ChevronDown, ChevronRight, BookOpen, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface Node { id: string; code: string; name: string; rank: string; rankColor: string; pv: number; gv: number; children?: Node[]; }

function countAll(node: Node): number { return 1 + (node.children?.reduce((s, c) => s + countAll(c), 0) ?? 0); }
function maxDepth(node: Node, d = 0): number { if (!node.children?.length) return d; return Math.max(...node.children.map(c => maxDepth(c, d + 1))); }

// ─── 예시 조직 데이터 ─────────────────────────────────
const DEMO_ROOT: Node = {
  id: "d0", code: "M-0001", name: "홍길동 (디렉터)", rank: "디렉터", rankColor: "#E8599A", pv: 5000000, gv: 45550000,
  children: [
    {
      id: "d1", code: "M-0010", name: "김매니저", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 12050000,
      children: [
        {
          id: "d11", code: "M-0100", name: "이팀원A", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 6050000,
          children: [
            { id: "d111", code: "M-1000", name: "박멤버1", rank: "멤버", rankColor: "#6B7280", pv: 50000, gv: 50000, children: [] },
            { id: "d112", code: "M-1001", name: "최멤버2", rank: "멤버", rankColor: "#6B7280", pv: 50000, gv: 50000, children: [] },
            { id: "d113", code: "M-1002", name: "강팀원B", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 3000000, children: [] },
          ],
        },
        { id: "d12", code: "M-0101", name: "오팀원C", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 3000000, children: [] },
      ],
    },
    {
      id: "d2", code: "M-0011", name: "정디렉터", rank: "디렉터", rankColor: "#E8599A", pv: 5000000, gv: 15000000,
      children: [
        { id: "d21", code: "M-0110", name: "윤매니저A", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 6000000, children: [
          { id: "d211", code: "M-1100", name: "임멤버3", rank: "멤버", rankColor: "#6B7280", pv: 50000, gv: 50000, children: [] },
          { id: "d212", code: "M-1101", name: "한매니저", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 3000000, children: [] },
        ]},
        { id: "d22", code: "M-0111", name: "장매니저B", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 3000000, children: [] },
      ],
    },
    {
      id: "d3", code: "M-0012", name: "신매니저Z", rank: "매니저", rankColor: "#378ADD", pv: 3000000, gv: 3000000, children: [],
    },
    { id: "d4", code: "M-0013", name: "류멤버", rank: "멤버", rankColor: "#6B7280", pv: 50000, gv: 50000, children: [] },
  ],
};

const DEMO_TIPS: Record<string, string> = {
  d0:  "✦ 최상위 디렉터 — 전체 GV 합산",
  d1:  "직추천 → 판권 수당 발생",
  d2:  "직추천 디렉터 → 판권 수당 발생",
  d3:  "직추천 → 판권 수당 발생",
  d11: "2단계 → 판권 수당 없음",
  d12: "2단계 → 판권 수당 없음",
  d21: "2단계 → 판권 수당 없음",
  d22: "2단계 → 판권 수당 없음",
};

const DEMO_TIP_COLOR: Record<string, string> = {
  d0: "#FFD700", d1: "#378ADD", d2: "#E8599A", d3: "#378ADD",
  d11: "#F87171", d12: "#F87171", d21: "#F87171", d22: "#F87171",
};

// ─── 트리 노드 ───────────────────────────────────────
function TreeNode({ node, depth = 0, search, isDemo = false }: { node: Node; depth?: number; search: string; isDemo?: boolean }) {
  const [open, setOpen] = useState(depth < 2);
  const has = !!node.children?.length;
  const match = !search || node.name.includes(search) || node.code.includes(search);
  const tip = isDemo ? DEMO_TIPS[node.id] : null;
  const tipColor = isDemo ? DEMO_TIP_COLOR[node.id] : "#C9A84C";

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "10px",
        paddingLeft: `${depth * 22 + 12}px`,
        background: depth === 0 ? "rgba(201,168,76,0.05)" : "transparent",
        border: depth === 0 ? "1px solid rgba(201,168,76,0.1)" : "1px solid transparent",
        transition: "background 0.15s", opacity: search && !match ? 0.3 : 1,
      }}
        onMouseEnter={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.04)"; }}
        onMouseLeave={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <button onClick={() => setOpen(!open)} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: has ? "pointer" : "default", color: "var(--text-muted)", flexShrink: 0 }}>
          {has ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bg-border)", display: "inline-block" }} />}
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${node.rankColor}22`, border: `1.5px solid ${node.rankColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: node.rankColor, flexShrink: 0 }}>{node.name[0]}</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{node.name}</span>
              <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: `${node.rankColor}22`, color: node.rankColor }}>{node.rank}</span>
              {tip && (
                <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "9px", fontWeight: 700, background: `${tipColor}14`, color: tipColor, border: `1px solid ${tipColor}30`, whiteSpace: "nowrap" }}>
                  {tip}
                </span>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", margin: 0 }}>{node.code}</p>
          </div>
          <div style={{ display: "flex", gap: "14px", marginLeft: "auto", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              창업비 <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                {node.pv >= 1000000 ? `${(node.pv / 10000).toFixed(0)}만` : `${node.pv.toLocaleString()}`}
              </span>
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              산하GV <span style={{ color: "var(--emerald)", fontWeight: 700 }}>
                {node.gv >= 10000000 ? `${(node.gv / 10000000).toFixed(2)}천만` : node.gv >= 10000 ? `${(node.gv / 10000).toFixed(0)}만` : node.gv.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
      {has && open && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, borderLeft: "1px dashed var(--bg-border)", left: `${depth * 22 + 22}px` }} />
          {node.children!.map(c => <TreeNode key={c.id} node={c} depth={depth + 1} search={search} isDemo={isDemo} />)}
        </div>
      )}
    </div>
  );
}

// ─── 데모 모달 ───────────────────────────────────────
function DemoModal({ onClose }: { onClose: () => void }) {
  const [demoSearch, setDemoSearch] = useState("");
  const total = countAll(DEMO_ROOT);
  const depth = maxDepth(DEMO_ROOT);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", overflowY: "auto", padding: "20px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "760px", margin: "0 auto", background: "var(--bg-surface)", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", fontSize: "10px", fontWeight: 800, color: "#10B981", marginBottom: "8px" }}>DEMO 예시</div>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>관리자 조직도 예시</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>실제 데이터가 아닌 설명용 가상 조직입니다</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* GV 설명 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            { label: "전체 회원", value: `${total}명`, color: "#C9A84C", desc: "예시 조직 전체" },
            { label: "최대 깊이", value: `${depth}단계`, color: "#4FA3E8", desc: "뿌리에서 말단까지" },
            { label: "최상위 GV", value: "4,555만", color: "#10B981", desc: "전체 산하 볼륨" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: s.color, margin: "2px 0" }}>{s.value}</p>
              <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* GV 계산 원리 */}
        <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "14px", padding: "14px 16px" }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#10B981", margin: "0 0 8px" }}>📊 산하 GV 계산 원리</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { name: "홍길동 (디렉터)", gv: "4,555만", desc: "본인 + 산하 전체 합산", color: "#E8599A" },
              { name: "김매니저", gv: "1,205만", desc: "본인 300만 + 산하 합산", color: "#378ADD" },
              { name: "정디렉터", gv: "1,500만", desc: "본인 500만 + 산하 합산", color: "#E8599A" },
              { name: "박멤버1", gv: "5만", desc: "본인 창업비만 (산하 없음)", color: "#6B7280" },
            ].map(r => (
              <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: "8px", background: "var(--bg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{r.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: r.color }}>{r.gv}</span>
                  <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 색상 범례 + 표시 설명 */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { color: "#E8599A", label: "👑 디렉터" },
            { color: "#378ADD", label: "👔 매니저" },
            { color: "#6B7280", label: "👤 멤버" },
            { color: "#FFD700",  label: "✦ 최상위" },
            { color: "#378ADD", label: "직추천 → 판권 발생" },
            { color: "#F87171", label: "2단계+ → 판권 없음" },
          ].map(l => (
            <span key={l.label} style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: `${l.color}12`, color: l.color, border: `1px solid ${l.color}30` }}>{l.label}</span>
          ))}
        </div>

        {/* 검색 */}
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input value={demoSearch} onChange={e => setDemoSearch(e.target.value)} placeholder="예시 조직 내 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px", width: "100%" }} />
        </div>

        {/* 예시 트리 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "14px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "10px", letterSpacing: "0.05em" }}>조직도 (예시)</p>
          <TreeNode node={DEMO_ROOT} depth={0} search={demoSearch} isDemo={true} />
        </div>

        {/* 승급 체크 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px 16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px" }}>🏆 승급 조건 체크 예시 (홍길동 기준)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[
              { label: "직추천 매니저 3명 이상", check: true,  val: "직추천 4명 (매니저 3명 포함)" },
              { label: "산하 전체 누적 2,000만원", check: true, val: "산하 GV 4,555만원 ✓" },
              { label: "→ 디렉터 유지 조건 충족", check: true, val: "" },
              { label: "직추천 디렉터 3명 + 산하 1억", check: false, val: "현재 디렉터 1명 (본부장 조건 미달)" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", background: r.check ? "rgba(16,185,129,0.06)" : "rgba(248,113,113,0.05)", border: `1px solid ${r.check ? "rgba(16,185,129,0.2)" : "rgba(248,113,113,0.15)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>{r.check ? "✅" : "❌"}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{r.label}</span>
                </div>
                {r.val && <span style={{ fontSize: "11px", color: r.check ? "#10B981" : "#F87171", fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>{r.val}</span>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────
export default function OrgPage() {
  const [search, setSearch]     = useState("");
  const [tree, setTree]         = useState<Node | null>(null);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState({ total: 0, depth: 0, newThisMonth: 0 });
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: members } = await supabase
        .from("members")
        .select("id, member_code, name, sponsor_id, personal_pv, group_gv, rank:ranks(name, color)")
        .eq("is_admin", false)
        .order("created_at");

      if (!members?.length) { setLoading(false); return; }

      const memberIds = new Set(members.map((m: any) => m.id));
      const roots = members.filter((m: any) => !m.sponsor_id || !memberIds.has(m.sponsor_id));

      const buildNode = (m: any): Node => ({
        id: m.id, code: m.member_code, name: m.name,
        rank: m.rank?.name ?? "멤버", rankColor: m.rank?.color ?? "#6B7280",
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

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>조직도</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>전체 추천 네트워크 구조</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setShowDemo(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
            background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.35)",
            color: "#10B981", fontSize: "12px", fontWeight: 700, transition: "all 0.2s",
          }}>
            <BookOpen size={13} /> 예시 보기
          </button>
          <div style={{ position: "relative", width: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="회원명, 번호 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px" }} />
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
        {[
          { label: "전체 회원", value: `${stats.total}명`, icon: Users, color: "var(--gold)" },
          { label: "최대 깊이", value: `${stats.depth}단계`, icon: GitBranch, color: "#4F8EF7" },
          { label: "이번달 신규", value: `${stats.newThisMonth}명`, icon: TrendingUp, color: "var(--emerald)" },
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
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", padding: "14px" }}>
        {loading
          ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>불러오는 중...</div>
          : tree
            ? <TreeNode node={tree} search={search} />
            : (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>등록된 회원이 없습니다</p>
                <button onClick={() => setShowDemo(true)} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                  background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.35)",
                  color: "#10B981", fontSize: "13px", fontWeight: 700,
                }}>
                  <BookOpen size={14} /> 조직도 예시 보기
                </button>
              </div>
            )}
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}
