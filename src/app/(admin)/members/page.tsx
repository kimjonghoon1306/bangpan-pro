"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, UserPlus, Download, Filter,
  ChevronUp, ChevronDown, ChevronRight,
  Users, TrendingUp, UserCheck, UserX,
} from "lucide-react";

const MEMBERS = [
  { id: "1", member_code: "M-012847", name: "김민수", email: "kim@test.com", phone: "010-1234-5678", rank: "골드", rank_level: 3, sponsor: "이영희", personal_pv: 850, group_gv: 12400, status: "ACTIVE", joined_at: "2023-03-15", this_month: 247000 },
  { id: "2", member_code: "M-012846", name: "박지현", email: "park@test.com", phone: "010-2345-6789", rank: "실버", rank_level: 2, sponsor: "최강산", personal_pv: 320, group_gv: 4800, status: "ACTIVE", joined_at: "2023-05-22", this_month: 98000 },
  { id: "3", member_code: "M-012845", name: "이준호", email: "lee@test.com", phone: "010-3456-7890", rank: "일반", rank_level: 1, sponsor: "김민수", personal_pv: 120, group_gv: 820, status: "ACTIVE", joined_at: "2023-08-11", this_month: 24000 },
  { id: "4", member_code: "M-012844", name: "정수아", email: "jung@test.com", phone: "010-4567-8901", rank: "일반", rank_level: 1, sponsor: "박지현", personal_pv: 0, group_gv: 0, status: "INACTIVE", joined_at: "2023-09-01", this_month: 0 },
  { id: "5", member_code: "M-012843", name: "한상욱", email: "han@test.com", phone: "010-5678-9012", rank: "실버", rank_level: 2, sponsor: "이준호", personal_pv: 450, group_gv: 3200, status: "ACTIVE", joined_at: "2023-11-20", this_month: 142000 },
  { id: "6", member_code: "M-012842", name: "오민정", email: "oh@test.com", phone: "010-6789-0123", rank: "골드", rank_level: 3, sponsor: "김민수", personal_pv: 920, group_gv: 18600, status: "ACTIVE", joined_at: "2022-12-05", this_month: 318000 },
  { id: "7", member_code: "M-012841", name: "강동현", email: "kang@test.com", phone: "010-7890-1234", rank: "일반", rank_level: 1, sponsor: "한상욱", personal_pv: 80, group_gv: 240, status: "SUSPENDED", joined_at: "2024-01-18", this_month: 0 },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "활성",   color: "var(--emerald)", bg: "rgba(16,185,129,0.12)" },
  INACTIVE:  { label: "비활성", color: "var(--text-muted)", bg: "var(--bg-border)" },
  SUSPENDED: { label: "정지",   color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

const RANK_MAP: Record<string, { color: string; bg: string }> = {
  다이아:   { color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  플래티넘: { color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  골드:     { color: "var(--gold)", bg: "rgba(201,168,76,0.12)" },
  실버:     { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  일반:     { color: "var(--text-muted)", bg: "var(--bg-border)" },
};

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [sortField, setSortField] = useState("member_code");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = MEMBERS.filter((m) => {
    const matchSearch = !search || m.name.includes(search) || m.member_code.includes(search) || m.email.includes(search) || m.phone.includes(search);
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchRank = rankFilter === "ALL" || m.rank === rankFilter;
    return matchSearch && matchStatus && matchRank;
  }).sort((a, b) => {
    const va = (a as any)[sortField];
    const vb = (b as any)[sortField];
    if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va;
    return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const totalActive = MEMBERS.filter(m => m.status === "ACTIVE").length;
  const totalSuspended = MEMBERS.filter(m => m.status === "SUSPENDED").length;
  const totalInactive = MEMBERS.filter(m => m.status === "INACTIVE").length;

  return (
    <div style={{ padding: "20px" }}>

      {/* ─── 요약 카드 ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "전체 회원", value: MEMBERS.length, icon: Users, color: "var(--gold)", bg: "rgba(201,168,76,0.1)" },
          { label: "활성 회원", value: totalActive, icon: UserCheck, color: "var(--emerald)", bg: "rgba(16,185,129,0.1)" },
          { label: "비활성", value: totalInactive, icon: TrendingUp, color: "var(--text-muted)", bg: "var(--bg-border)" },
          { label: "정지 회원", value: totalSuspended, icon: UserX, color: "#F87171", bg: "rgba(239,68,68,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>{s.label}</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 툴바 ─── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
        {/* 검색 */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 회원번호, 이메일, 전화번호 검색..."
            className="input-base" style={{ paddingLeft: "36px", fontSize: "13px" }}
          />
        </div>

        {/* 필터 토글 (모바일) */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", background: showFilter ? "rgba(201,168,76,0.1)" : "var(--bg-elevated)", border: `1px solid ${showFilter ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`, color: showFilter ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
        >
          <Filter size={14} /> 필터
        </button>

        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <button className="btn-outline" style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px" }}>
            <Download size={14} /> 내보내기
          </button>
          <button
            onClick={() => router.push("/members/new")}
            className="btn-gold" style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
          >
            <UserPlus size={14} /> 회원 등록
          </button>
        </div>
      </div>

      {/* ─── 필터 패널 ─── */}
      {showFilter && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px", marginBottom: "14px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>상태</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                  background: statusFilter === s ? "rgba(201,168,76,0.15)" : "var(--bg)",
                  border: `1px solid ${statusFilter === s ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
                  color: statusFilter === s ? "var(--gold)" : "var(--text-secondary)",
                }}>
                  {s === "ALL" ? "전체" : STATUS_MAP[s]?.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>직급</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL", "다이아", "플래티넘", "골드", "실버", "일반"].map((r) => (
                <button key={r} onClick={() => setRankFilter(r)} style={{
                  padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                  background: rankFilter === r ? "rgba(201,168,76,0.15)" : "var(--bg)",
                  border: `1px solid ${rankFilter === r ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
                  color: rankFilter === r ? "var(--gold)" : "var(--text-secondary)",
                }}>
                  {r === "ALL" ? "전체" : r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── PC 테이블 ─── */}
      <div className="hidden md:block" style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table-base">
            <thead>
              <tr>
                {[
                  { label: "회원번호", field: "member_code" },
                  { label: "이름", field: "name" },
                  { label: "직급", field: "rank_level" },
                  { label: "추천인", field: "sponsor" },
                  { label: "개인PV", field: "personal_pv" },
                  { label: "그룹GV", field: "group_gv" },
                  { label: "이달수당", field: "this_month" },
                  { label: "가입일", field: "joined_at" },
                  { label: "상태", field: "status" },
                ].map((col) => (
                  <th key={col.field}>
                    <button onClick={() => toggleSort(col.field)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {col.label}
                      {sortField === col.field
                        ? sortDir === "asc" ? <ChevronUp size={11} color="var(--gold)" /> : <ChevronDown size={11} color="var(--gold)" />
                        : <ChevronUp size={11} style={{ opacity: 0.25 }} />
                      }
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const rank = RANK_MAP[m.rank] || RANK_MAP["일반"];
                const status = STATUS_MAP[m.status];
                return (
                  <tr key={m.id} onClick={() => router.push(`/members/${m.id}`)} style={{ cursor: "pointer" }}>
                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>{m.member_code}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: rank.bg, border: `1px solid ${rank.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: rank.color, flexShrink: 0 }}>
                          {m.name[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: rank.bg, color: rank.color, border: `1px solid ${rank.color}33` }}>
                        {m.rank}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{m.sponsor}</td>
                    <td style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{m.personal_pv.toLocaleString()}</td>
                    <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{m.group_gv.toLocaleString()}</td>
                    <td style={{ fontSize: "13px", fontWeight: 600, color: m.this_month > 0 ? "var(--gold)" : "var(--text-muted)" }}>
                      {m.this_month > 0 ? `₩${m.this_month.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{m.joined_at}</td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--bg-border)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>총 {filtered.length}명</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3,"...",10].map((p, i) => (
              <button key={i} style={{ width: 30, height: 30, borderRadius: "8px", fontSize: "12px", cursor: "pointer", background: p === 1 ? "rgba(201,168,76,0.15)" : "transparent", border: `1px solid ${p === 1 ? "rgba(201,168,76,0.3)" : "transparent"}`, color: p === 1 ? "var(--gold)" : "var(--text-muted)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 모바일 카드 리스트 ─── */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((m) => {
          const rank = RANK_MAP[m.rank] || RANK_MAP["일반"];
          const status = STATUS_MAP[m.status];
          return (
            <div
              key={m.id}
              onClick={() => router.push(`/members/${m.id}`)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "12px" }}
            >
              {/* 아바타 */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: rank.bg, border: `2px solid ${rank.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: rank.color, flexShrink: 0 }}>
                {m.name[0]}
              </div>

              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{m.name}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: rank.bg, color: rank.color }}>{m.rank}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, background: status.bg, color: status.color }}>{status.label}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{m.member_code}</p>
                <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>PV <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{m.personal_pv}</span></span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>GV <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{m.group_gv.toLocaleString()}</span></span>
                  {m.this_month > 0 && <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600 }}>₩{m.this_month.toLocaleString()}</span>}
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
