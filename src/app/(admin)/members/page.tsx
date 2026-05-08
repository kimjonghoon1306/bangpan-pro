"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit3,
  Ban,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const DEMO_MEMBERS = [
  { id: "1", member_code: "M-012847", name: "김민수", email: "kim@test.com", phone: "010-1234-5678", rank: "골드", rank_level: 3, sponsor: "이영희", personal_pv: 850, group_gv: 12400, status: "ACTIVE", joined_at: "2023-03-15" },
  { id: "2", member_code: "M-012846", name: "박지현", email: "park@test.com", phone: "010-2345-6789", rank: "실버", rank_level: 2, sponsor: "최강산", personal_pv: 320, group_gv: 4800, status: "ACTIVE", joined_at: "2023-05-22" },
  { id: "3", member_code: "M-012845", name: "이준호", email: "lee@test.com", phone: "010-3456-7890", rank: "일반", rank_level: 1, sponsor: "김민수", personal_pv: 120, group_gv: 820, status: "ACTIVE", joined_at: "2023-08-11" },
  { id: "4", member_code: "M-012844", name: "정수아", email: "jung@test.com", phone: "010-4567-8901", rank: "일반", rank_level: 1, sponsor: "박지현", personal_pv: 0, group_gv: 0, status: "INACTIVE", joined_at: "2023-09-01" },
  { id: "5", member_code: "M-012843", name: "한상욱", email: "han@test.com", phone: "010-5678-9012", rank: "실버", rank_level: 2, sponsor: "이준호", personal_pv: 450, group_gv: 3200, status: "ACTIVE", joined_at: "2023-11-20" },
  { id: "6", member_code: "M-012842", name: "오민정", email: "oh@test.com", phone: "010-6789-0123", rank: "골드", rank_level: 3, sponsor: "김민수", personal_pv: 920, group_gv: 18600, status: "ACTIVE", joined_at: "2022-12-05" },
  { id: "7", member_code: "M-012841", name: "강동현", email: "kang@test.com", phone: "010-7890-1234", rank: "일반", rank_level: 1, sponsor: "한상욱", personal_pv: 80, group_gv: 240, status: "SUSPENDED", joined_at: "2024-01-18" },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "활성", cls: "badge-green" },
  INACTIVE: { label: "비활성", cls: "badge-gray" },
  SUSPENDED: { label: "정지", cls: "badge-red" },
};

const RANK_MAP: Record<string, string> = {
  골드: "badge-gold",
  실버: "text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5 text-[10px]",
  일반: "badge-gray",
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("member_code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = DEMO_MEMBERS.filter((m) => {
    const matchSearch =
      !search ||
      m.name.includes(search) ||
      m.member_code.includes(search) ||
      m.email.includes(search);
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function toggleSort(field: string) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-text-muted opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-gold" />
      : <ChevronDown className="w-3 h-3 text-gold" />;
  }

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">회원 관리</h1>
          <p className="text-text-muted text-sm mt-0.5">전체 {DEMO_MEMBERS.length.toLocaleString()}명</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            내보내기
          </button>
          <button className="btn-gold flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" />
            회원 등록
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 회원번호, 이메일 검색..."
            className="input-base pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                statusFilter === s
                  ? "bg-gold/15 text-gold border border-gold/25"
                  : "bg-bg-elevated text-text-secondary border border-bg-border hover:border-gold/20"
              )}
            >
              {s === "ALL" ? "전체" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="card-elevated overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>
                  <button onClick={() => toggleSort("member_code")} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
                    회원번호 <SortIcon field="member_code" />
                  </button>
                </th>
                <th>이름</th>
                <th>직급</th>
                <th>추천인</th>
                <th>
                  <button onClick={() => toggleSort("personal_pv")} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
                    개인 PV <SortIcon field="personal_pv" />
                  </button>
                </th>
                <th>
                  <button onClick={() => toggleSort("group_gv")} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
                    그룹 GV <SortIcon field="group_gv" />
                  </button>
                </th>
                <th>가입일</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="group">
                  <td className="font-mono text-xs text-text-muted">{m.member_code}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-xs text-text-secondary flex-shrink-0">
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{m.name}</p>
                        <p className="text-[11px] text-text-muted">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn("badge text-[10px]", RANK_MAP[m.rank] || "badge-gray")}>
                      {m.rank}
                    </span>
                  </td>
                  <td className="text-sm text-text-secondary">{m.sponsor}</td>
                  <td className="text-sm font-medium text-text-primary">{m.personal_pv.toLocaleString()}</td>
                  <td className="text-sm text-text-secondary">{m.group_gv.toLocaleString()}</td>
                  <td className="text-xs text-text-muted">{m.joined_at}</td>
                  <td>
                    <span className={cn("badge text-[10px]", STATUS_MAP[m.status]?.cls)}>
                      {STATUS_MAP[m.status]?.label}
                    </span>
                  </td>
                  <td>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                        className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === m.id && (
                        <div className="absolute right-0 top-8 z-20 bg-bg-elevated border border-bg-border rounded-xl shadow-elevated py-1 min-w-[140px]">
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors">
                            <Eye className="w-3.5 h-3.5" /> 상세 보기
                          </button>
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors">
                            <Edit3 className="w-3.5 h-3.5" /> 정보 수정
                          </button>
                          <div className="my-1 border-t border-bg-border" />
                          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-bg-surface transition-colors">
                            <Ban className="w-3.5 h-3.5" /> 정지 처리
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
          <span className="text-xs text-text-muted">{filtered.length}명 표시</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button
                key={i}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors",
                  p === 1
                    ? "bg-gold/15 text-gold border border-gold/25"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
