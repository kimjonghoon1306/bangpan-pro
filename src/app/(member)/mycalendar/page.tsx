"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Download, CheckCircle, Clock, TrendingUp, Wallet } from "lucide-react";
import { Skeleton, SkeletonStyle } from "@/components/ui/Skeleton";

function getFridays(year: number, month: number): Date[] {
  const fridays: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === 5) fridays.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return fridays;
}

function getPayWeek(friday: Date) {
  const twoWeeksBefore = new Date(friday);
  twoWeeksBefore.setDate(friday.getDate() - 14);
  const twoWeeksBeforeEnd = new Date(twoWeeksBefore);
  twoWeeksBeforeEnd.setDate(twoWeeksBefore.getDate() + 6);
  return { start: twoWeeksBefore, end: twoWeeksBeforeEnd };
}

function toDateStr(d: Date) { return d.toISOString().split("T")[0]; }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// 내 수당 상세 팝업
function MyPaymentModal({ friday, memberId, onClose }: { friday: Date; memberId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  const { start, end } = getPayWeek(friday);
  const payDateStr = friday.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
  const periodStr = `${toDateStr(start)} ~ ${toDateStr(end)}`;

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();

      // 지급 완료 여부
      const { data: ws } = await supabase.from("weekly_settlements")
        .select("status").eq("payment_date", toDateStr(friday)).maybeSingle();
      setIsPaid(ws?.status === "PAID");

      // 해당 기간 내 수당
      const { data: comms } = await supabase.from("commissions")
        .select("id, amount, rate, base_amount, created_at, rule:commission_rules(name, rule_type), source_member:members!source_member_id(name)")
        .eq("member_id", memberId)
        .gte("created_at", toDateStr(start) + "T00:00:00")
        .lte("created_at", toDateStr(end) + "T23:59:59")
        .order("created_at", { ascending: false });

      const list = (comms as any[]) ?? [];
      setItems(list);
      setTotal(list.reduce((s, c) => s + c.amount, 0));
      setLoading(false);
    }
    load();
  }, []);

  const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
    REFERRAL:   { label: "판권", color: "#4FA3E8", bg: "rgba(79,163,232,0.1)" },
    TEAM:       { label: "관리비용", color: "#EF9F27", bg: "rgba(239,159,39,0.1)" },
    RANK_BONUS: { label: "직급", color: "#00C896", bg: "rgba(0,200,150,0.1)" },
  };

  const net = Math.floor(total * 0.967);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "480px",
        background: "var(--bg-surface)", borderRadius: "24px 24px 0 0",
        maxHeight: "85vh", overflowY: "auto",
        animation: "slideUp 0.3s ease",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* 헤더 */}
        <div style={{ background: isPaid ? "rgba(0,200,150,0.06)" : "rgba(255,45,120,0.06)", borderBottom: "1px solid var(--bg-border)", padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                {isPaid
                  ? <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: "rgba(0,200,150,0.15)", color: "#00C896", border: "1px solid rgba(0,200,150,0.3)" }}>✓ 지급 완료</span>
                  : <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: "rgba(255,45,120,0.15)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.3)" }}>💰 지급 예정</span>
                }
              </div>
              <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>{payDateStr}</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>정산 기간 {periodStr}</p>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
              <X size={15} />
            </button>
          </div>

          {/* 금액 요약 */}
          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
              <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.15)", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>세전 수당</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 900, color: "#FF2D78" }}>{formatKRW(total)}</p>
              </div>
              <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(0,200,150,0.06)", border: "1px solid rgba(0,200,150,0.15)", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>실수령 (3.3%↓)</p>
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 900, color: "#00C896" }}>{formatKRW(net)}</p>
              </div>
            </div>
          )}
        </div>

        {/* 상세 내역 */}
        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <SkeletonStyle />
              {Array.from({length: 3}).map((_, i) => <Skeleton key={i} height={52} borderRadius={10} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              해당 기간 수당 내역이 없습니다
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map(c => {
                const ti = TYPE_MAP[(c.rule as any)?.rule_type ?? ""] ?? { label: "수당", color: "#A78BFA", bg: "rgba(167,139,250,0.1)" };
                const dt = new Date(c.created_at);
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--bg-border)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "9px", background: ti.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: ti.color, flexShrink: 0 }}>{ti.label}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(c.rule as any)?.name ?? "수당"}{(c.source_member as any)?.name ? ` — ${(c.source_member as any).name}` : ""}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        {String(dt.getMonth()+1).padStart(2,"0")}.{String(dt.getDate()).padStart(2,"0")}
                        {c.base_amount > 0 && c.rate ? ` · ${c.base_amount.toLocaleString()}원 × ${c.rate}%` : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: ti.color, flexShrink: 0 }}>+{c.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemberCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [memberId, setMemberId] = useState("");
  const [selectedFriday, setSelectedFriday] = useState<Date | null>(null);
  const [calData, setCalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [monthStats, setMonthStats] = useState({ total: 0, paid: 0, pending: 0 });

  const fridays = getFridays(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const todayStr = toDateStr(now);
  const monthName = new Date(year, month).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  useEffect(() => {
    async function loadMember() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setMemberId(session.user.id);
    }
    loadMember();
  }, []);

  useEffect(() => {
    if (!memberId) return;
    async function load() {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const start = toDateStr(new Date(year, month, 1));
      const end = toDateStr(new Date(year, month + 1, 0));

      const [{ data: settlements }, { data: comms }] = await Promise.all([
        supabase.from("weekly_settlements").select("payment_date, status, total_commission").gte("payment_date", start).lte("payment_date", end),
        supabase.from("commissions").select("amount, created_at").eq("member_id", memberId).gte("created_at", start + "T00:00:00").lte("created_at", end + "T23:59:59"),
      ]);

      // 금요일별 내 수당 집계 (클라이언트 계산)
      const fridayAmounts: Record<string, number> = {};
      for (const fri of fridays) {
        const { start: ws, end: we } = getPayWeek(fri);
        const wsStr = toDateStr(ws); const weStr = toDateStr(we);
        const amt = (comms ?? []).filter((c: any) => {
          const d = c.created_at?.split("T")[0] ?? "";
          return d >= wsStr && d <= weStr;
        }).reduce((s: number, c: any) => s + c.amount, 0);
        fridayAmounts[toDateStr(fri)] = amt;
      }

      const paidSet = new Set((settlements ?? []).filter((s: any) => s.status === "PAID").map((s: any) => s.payment_date));
      const totalMonthComm = (comms ?? []).reduce((s: number, c: any) => s + c.amount, 0);
      const paidComm = (settlements ?? []).filter((s: any) => s.status === "PAID").reduce((s: number, settlement: any) => s + (settlement.total_commission ?? 0), 0);

      setCalData({ fridayAmounts, paidSet, settlements: settlements ?? [] });
      setMonthStats({ total: totalMonthComm, paid: paidComm, pending: totalMonthComm - paidComm });
      setLoading(false);
    }
    load();
  }, [memberId, year, month]);

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <SkeletonStyle />
      <style>{`@keyframes pinkPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,45,120,0.4)}60%{box-shadow:0 0 0 8px rgba(255,45,120,0)}}`}</style>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>수당 캘린더</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>매주 금요일 내 수당 지급 현황</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontFamily: "Syne,sans-serif", fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", minWidth: "110px", textAlign: "center" }}>{monthName}</span>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 이번달 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "10px" }}>
        {[
          { label: "이번달 수당", value: formatKRW(monthStats.total), color: "#FF2D78", icon: Wallet },
          { label: "지급 완료",   value: formatKRW(monthStats.paid),  color: "#00C896", icon: CheckCircle },
          { label: "지급 예정",   value: formatKRW(monthStats.pending), color: "#FF9500", icon: Clock },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", border: `1px solid ${s.color}22`, borderRadius: "14px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <s.icon size={13} color={s.color} />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p style={{ fontFamily: "Syne,sans-serif", fontSize: "18px", fontWeight: 800, color: s.color, margin: 0 }}>
              {loading ? "..." : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* 금요일 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "10px" }}>
        {fridays.map(fri => {
          const ds = toDateStr(fri);
          const isPaid = calData?.paidSet?.has(ds);
          const amt = calData?.fridayAmounts?.[ds] ?? 0;
          const isFuture = fri > now;
          const isToday = isSameDay(fri, now);
          return (
            <button key={ds} onClick={() => setSelectedFriday(fri)} style={{
              padding: "14px", borderRadius: "16px", textAlign: "left", cursor: "pointer",
              background: isPaid ? "rgba(0,200,150,0.07)" : "rgba(255,45,120,0.05)",
              border: `1.5px solid ${isPaid ? "rgba(0,200,150,0.25)" : isToday ? "rgba(255,45,120,0.5)" : "rgba(255,45,120,0.2)"}`,
              animation: isToday ? "pinkPulse 2s infinite" : "none",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: isPaid ? "#00C896" : "#FF2D78" }}>
                  {fri.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} 금
                </span>
                {isPaid
                  ? <span style={{ fontSize: "10px", fontWeight: 800, color: "#00C896", padding: "1px 6px", background: "rgba(0,200,150,0.15)", borderRadius: "999px" }}>완료</span>
                  : isFuture
                  ? <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF9500", padding: "1px 6px", background: "rgba(255,149,0,0.15)", borderRadius: "999px" }}>예정</span>
                  : <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF2D78", padding: "1px 6px", background: "rgba(255,45,120,0.15)", borderRadius: "999px" }}>확인</span>
                }
              </div>
              {loading ? <Skeleton height={20} /> : (
                <p style={{ fontFamily: "Syne,sans-serif", fontSize: "17px", fontWeight: 900, color: isPaid ? "#00C896" : "#FF2D78", margin: 0 }}>
                  {amt > 0 ? formatKRW(amt) : "—"}
                </p>
              )}
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "2px 0 0" }}>탭하여 상세 보기</p>
            </button>
          );
        })}
      </div>

      {/* 달력 */}
      <div style={{ background: "var(--bg-elevated)", border: "1.5px solid rgba(255,45,120,0.12)", borderRadius: "18px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--bg-border)" }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: "11px", fontWeight: 700, color: i === 5 ? "#FF2D78" : i === 0 ? "#4FA3E8" : "var(--text-muted)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} style={{ minHeight: "60px", borderRight: "1px solid var(--bg-border)", borderBottom: "1px solid var(--bg-border)" }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const d = new Date(year, month, day);
            const ds = toDateStr(d);
            const isFri = d.getDay() === 5;
            const isSun = d.getDay() === 0;
            const isToday2 = ds === todayStr;
            const isPaid = calData?.paidSet?.has(ds);
            const amt = calData?.fridayAmounts?.[ds] ?? 0;
            const isFutureFri = isFri && d > now;

            return (
              <div key={day} onClick={isFri ? () => setSelectedFriday(d) : undefined} style={{
                minHeight: "60px", padding: "6px",
                borderRight: "1px solid var(--bg-border)", borderBottom: "1px solid var(--bg-border)",
                background: isFri ? (isPaid ? "rgba(0,200,150,0.04)" : "rgba(255,45,120,0.03)") : "transparent",
                cursor: isFri ? "pointer" : "default",
                transition: "background 0.1s",
              }}
                onMouseEnter={isFri ? e => (e.currentTarget as HTMLElement).style.background = isPaid ? "rgba(0,200,150,0.09)" : "rgba(255,45,120,0.08)" : undefined}
                onMouseLeave={isFri ? e => (e.currentTarget as HTMLElement).style.background = isFri ? (isPaid ? "rgba(0,200,150,0.04)" : "rgba(255,45,120,0.03)") : "transparent" : undefined}
              >
                <div style={{ marginBottom: "3px" }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: isToday2 ? 900 : 500,
                    background: isToday2 ? "#FF2D78" : "transparent",
                    color: isToday2 ? "#fff" : isFri ? "#FF2D78" : isSun ? "#4FA3E8" : "var(--text-primary)",
                  }}>{day}</span>
                </div>
                {isFri && (
                  loading ? <Skeleton height={12} width="80%" /> : (
                    isPaid ? (
                      <div style={{ padding: "3px 5px", borderRadius: "6px", background: "rgba(0,200,150,0.12)" }}>
                        <p style={{ fontSize: "9px", fontWeight: 700, color: "#00C896", margin: 0 }}>✓ 완료</p>
                        {amt > 0 && <p style={{ fontSize: "10px", fontWeight: 800, color: "#00C896", margin: 0 }}>{amt >= 10000 ? `${Math.floor(amt/10000)}만` : formatKRW(amt)}</p>}
                      </div>
                    ) : amt > 0 ? (
                      <div style={{ padding: "3px 5px", borderRadius: "6px", background: "rgba(255,45,120,0.1)", animation: isFutureFri ? "pinkPulse 3s infinite" : "none" }}>
                        <p style={{ fontSize: "8px", fontWeight: 700, color: "#FF2D78", margin: 0 }}>💰 지급일</p>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: "#FF2D78", margin: 0 }}>{amt >= 10000 ? `${Math.floor(amt/10000)}만` : formatKRW(amt)}</p>
                      </div>
                    ) : (
                      <div style={{ padding: "3px 5px", borderRadius: "6px", background: "rgba(255,45,120,0.05)" }}>
                        <p style={{ fontSize: "9px", color: "rgba(255,45,120,0.4)", margin: 0 }}>지급일</p>
                      </div>
                    )
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", padding: "10px 14px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
        {[
          { color: "#FF2D78", label: "지급일 (내 수당 있음)" },
          { color: "#00C896", label: "지급 완료" },
          { color: "#FF2D78", label: "오늘", circle: true },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {s.circle
              ? <span style={{ width: 18, height: 18, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff", fontWeight: 800 }}>1</span>
              : <span style={{ width: 12, height: 12, borderRadius: "3px", background: `${s.color}22`, border: `1.5px solid ${s.color}` }} />
            }
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {selectedFriday && memberId && (
        <MyPaymentModal friday={selectedFriday} memberId={memberId} onClose={() => setSelectedFriday(null)} />
      )}
    </div>
  );
}
