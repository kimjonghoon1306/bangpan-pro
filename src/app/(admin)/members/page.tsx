"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Download, Filter, ChevronUp, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "활성",   color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
  INACTIVE:  { label: "비활성", color: "var(--text-muted)", bg: "var(--bg-border)" },
  SUSPENDED: { label: "정지",   color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

const RANK_COLOR: Record<string, { color: string; bg: string }> = {
  디렉터: { color: "#E8599A", bg: "rgba(232,89,154,0.12)" },
  매니저: { color: "#378ADD", bg: "rgba(55,138,221,0.12)"  },
  멤버:   { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  // fallback — 이전 직급명 호환
  다이아:   { color: "#38BDF8", bg: "rgba(56,189,248,0.12)"  },
  플래티넘: { color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  골드:     { color: "#C9A84C", bg: "rgba(201,168,76,0.12)"  },
  실버:     { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  일반회원: { color: "#444466", bg: "rgba(68,68,102,0.12)"   },
};

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const { members, total, loading, error, refetch } = useMembers({
    search, status: statusFilter, page,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>회원 관리</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>전체 {total.toLocaleString()}명</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={refetch} style={{ width: 36, height: 36, borderRadius: "9px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
          <button className="btn-outline" style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px" }}>
            <Download size={14} /> 내보내기
          </button>
          <button onClick={() => router.push("/members/new")} className="btn-gold" style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <UserPlus size={14} /> 회원 등록
          </button>
        </div>
      </div>

      {/* 검색 & 필터 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "6px", flex: 1, minWidth: "200px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="이름, 회원번호, 이메일 검색..." className="input-base" style={{ paddingLeft: "34px", fontSize: "13px" }} />
          </div>
          <button type="submit" className="btn-gold" style={{ fontSize: "13px", padding: "9px 16px", whiteSpace: "nowrap" }}>검색</button>
        </form>
        <button onClick={() => setShowFilter(!showFilter)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", background: showFilter ? "rgba(108,71,255,0.1)" : "var(--bg-elevated)", border: `1px solid ${showFilter ? "rgba(108,71,255,0.3)" : "var(--bg-border)"}`, color: showFilter ? "var(--violet)" : "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
          <Filter size={14} /> 필터
        </button>
      </div>

      {showFilter && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "12px", padding: "14px", marginBottom: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL","ACTIVE","INACTIVE","SUSPENDED"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", background: statusFilter === s ? "rgba(108,71,255,0.12)" : "var(--bg)", border: `1px solid ${statusFilter === s ? "rgba(108,71,255,0.3)" : "var(--bg-border)"}`, color: statusFilter === s ? "var(--violet)" : "var(--text-secondary)" }}>
              {s === "ALL" ? "전체" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: "13px", marginBottom: "12px" }}>
          오류: {error}
        </div>
      )}

      {/* PC 테이블 */}
      <div className="hidden md:block" style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                {["회원번호","이름","직급","추천인","개인PV","그룹GV","가입일","상태"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                  <RefreshCw size={20} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
                </td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>회원이 없습니다.</td></tr>
              ) : members.map((m) => {
                const rc = RANK_COLOR[m.rank?.name ?? "일반회원"] || RANK_COLOR["일반회원"];
                const sc = STATUS_MAP[m.status] || STATUS_MAP["INACTIVE"];
                return (
                  <tr key={m.id} onClick={() => router.push(`/members/${m.id}`)} style={{ borderBottom: "1px solid var(--bg-border)", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.03)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>{m.member_code}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rc.bg, border: `1px solid ${rc.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: rc.color, flexShrink: 0 }}>{m.name[0]}</div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: rc.bg, color: rc.color }}>{m.rank?.name ?? "일반"}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>{m.sponsor?.name ?? "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{m.personal_pv.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>{m.group_gv.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: "12px", color: "var(--text-muted)" }}>{m.joined_at?.slice(0,10)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--bg-border)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{total.toLocaleString()}명 중 {members.length}명 표시</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ width: 30, height: 30, borderRadius: "8px", background: "transparent", border: "1px solid var(--bg-border)", cursor: page === 1 ? "not-allowed" : "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronUp size={12} />
            </button>
            <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "12px", color: "var(--text-secondary)" }}>{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ width: 30, height: 30, borderRadius: "8px", background: "transparent", border: "1px solid var(--bg-border)", cursor: page >= totalPages ? "not-allowed" : "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", opacity: page >= totalPages ? 0.4 : 1 }}>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 카드 */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <RefreshCw size={20} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
          </div>
        ) : members.map((m) => {
          const rc = RANK_COLOR[m.rank?.name ?? "일반회원"] || RANK_COLOR["일반회원"];
          const sc = STATUS_MAP[m.status] || STATUS_MAP["INACTIVE"];
          return (
            <div key={m.id} onClick={() => router.push(`/members/${m.id}`)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: rc.bg, border: `2px solid ${rc.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: rc.color, flexShrink: 0 }}>{m.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{m.name}</span>
                  <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: rc.bg, color: rc.color }}>{m.rank?.name ?? "일반"}</span>
                  <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{m.member_code}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>PV <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{m.personal_pv}</span></span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>GV <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{m.group_gv.toLocaleString()}</span></span>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
