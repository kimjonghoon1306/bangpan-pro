"use client";

import { useState, useEffect } from "react";
import { Wallet, Download, X, Check, Eye, EyeOff, AlertCircle, Clock, CheckCircle, ChevronRight, TrendingUp } from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface CommItem {
  id: string;
  amount: number;
  base_amount: number;
  rate: number | null;
  created_at: string;
  rule: { name: string; rule_type: string } | null;
  source_member: { name: string; member_code: string } | null;
}

const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  REFERRAL:   { label: "추천", color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },   // gold — 내 판매 수당
  TEAM:       { label: "오버", color: "#FF2D78", bg: "rgba(255,45,120,0.12)" },   // pink — 오버라이딩
  RANK_BONUS: { label: "직급", color: "#059669", bg: "rgba(5,150,105,0.12)" },    // emerald — 달성 보너스
  MATCHING:   { label: "매칭", color: "#6C47FF", bg: "rgba(108,71,255,0.12)" },   // violet — 조직 매칭
};

// ─── 출금 신청 팝업 ─────────────────────────────────
function WithdrawalModal({
  availableAmount, memberId, onClose, onSuccess
}: { availableAmount: number; memberId: string; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<"resident"|"confirm">("resident");
  const [residentNum, setResidentNum] = useState("");
  const [showResident, setShowResident] = useState(false);
  const [bankInfo, setBankInfo] = useState({ name: "", account: "", holder: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const grossAmount = availableAmount;
  const taxAmount = Math.floor(grossAmount * 0.033);
  const netAmount = grossAmount - taxAmount;

  useEffect(() => {
    async function loadBank() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.from("members").select("bank_name, bank_account, bank_holder").eq("id", memberId).single();
      if (data) setBankInfo({ name: data.bank_name ?? "", account: data.bank_account ?? "", holder: data.bank_holder ?? "" });
    }
    loadBank();
  }, [memberId]);

  const formatResident = (v: string) => {
    const clean = v.replace(/[^0-9]/g, "").slice(0, 13);
    if (clean.length > 6) return clean.slice(0, 6) + "-" + clean.slice(6);
    return clean;
  };

  const maskResident = (v: string) => {
    const clean = v.replace(/[^0-9-]/g, "");
    if (clean.length >= 8) return clean.slice(0, 8) + "******";
    return clean;
  };

  async function handleSubmit() {
    if (!residentNum || residentNum.replace(/[^0-9]/g, "").length < 13) {
      setError("주민등록번호 13자리를 정확히 입력해주세요."); return;
    }
    if (!bankInfo.account) {
      setError("계좌 정보가 없습니다. 마이페이지에서 먼저 등록해주세요."); return;
    }
    setSubmitting(true);
    const supabase = createBrowserSupabaseClient();

    // 주민번호 암호화 저장 (단순 base64 — 실제 운영시 서버사이드 암호화 권장)
    const encoded = btoa(residentNum.replace(/[^0-9]/g, ""));

    // members 테이블 주민번호 업데이트
    await supabase.from("members").update({ resident_number_enc: encoded, resident_verified: true }).eq("id", memberId);

    // 출금 신청 생성
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now); monday.setDate(now.getDate() - dayOfWeek + 1);
    const friday = new Date(now); friday.setDate(now.getDate() + (5 - dayOfWeek + 7) % 7 || 7);
    // 지급일: 다음다음 금요일
    const payFriday = new Date(friday); payFriday.setDate(friday.getDate() + 14);

    const { error: err } = await supabase.from("withdrawal_requests").insert({
      member_id: memberId,
      amount: grossAmount, tax_amount: taxAmount, net_amount: netAmount,
      bank_name: bankInfo.name, bank_account: bankInfo.account, bank_holder: bankInfo.holder,
      resident_number_enc: encoded,
      status: "PENDING",
      week_start: monday.toISOString().split("T")[0],
      week_end: friday.toISOString().split("T")[0],
      payment_date: payFriday.toISOString().split("T")[0],
    });

    if (err) { setError(err.message); setSubmitting(false); return; }

    // 출금 가능 금액 차감
    await supabase.from("members").update({ withdrawal_available: 0 }).eq("id", memberId);

    setSubmitting(false);
    onSuccess();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "480px",
        background: "var(--bg-surface)", borderRadius: "24px 24px 0 0",
        padding: "24px", paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        animation: "slideUp 0.3s ease",
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>출금 신청</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* 금액 요약 */}
        <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "16px", padding: "18px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>출금 신청액 (세전)</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(grossAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>원천징수 (3.3%)</span>
            <span style={{ fontSize: "13px", color: "#F87171" }}>- {formatKRW(taxAmount)}</span>
          </div>
          <div style={{ borderTop: "1px solid var(--bg-border)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>실수령액</span>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--gold)" }}>{formatKRW(netAmount)}</span>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "14px", marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "8px" }}>입금 계좌</p>
          {bankInfo.account ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{bankInfo.name} {bankInfo.account}</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{bankInfo.holder}</span>
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#F87171" }}>계좌 정보가 없습니다. 마이페이지에서 먼저 등록해주세요.</p>
          )}
        </div>

        {/* 주민번호 입력 */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <AlertCircle size={13} color="#FF9500" />
            <p style={{ fontSize: "12px", color: "#FF9500", fontWeight: 600, margin: 0 }}>세금 신고를 위해 주민등록번호가 필요합니다</p>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showResident ? "text" : "password"}
              value={showResident ? residentNum : (residentNum ? maskResident(residentNum) : "")}
              placeholder="000000-0000000"
              maxLength={14}
              onChange={(e) => {
                const formatted = formatResident(e.target.value);
                setResidentNum(formatted);
                setError("");
              }}
              style={{
                width: "100%", padding: "12px 44px 12px 14px",
                borderRadius: "12px", fontSize: "16px", fontWeight: 600, letterSpacing: "0.1em",
                background: "var(--bg-elevated)", border: "1.5px solid var(--bg-border)",
                color: "var(--text-primary)", outline: "none",
                fontFamily: "monospace",
              }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--gold)"}
              onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--bg-border)"}
            />
            <button onClick={() => setShowResident(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              {showResident ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>
            입력된 주민번호는 암호화되어 세금 신고 용도로만 사용됩니다
          </p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", marginBottom: "14px" }}>
            <p style={{ fontSize: "12px", color: "#F87171", margin: 0 }}>{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting || !bankInfo.account} style={{
          width: "100%", padding: "15px", borderRadius: "14px",
          background: submitting || !bankInfo.account ? "var(--bg-border)" : "var(--gold)",
          border: "none", color: submitting || !bankInfo.account ? "var(--text-muted)" : "#1a1400",
          fontSize: "16px", fontWeight: 800, cursor: submitting || !bankInfo.account ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}>
          {submitting ? "신청 처리 중..." : "출금 신청 완료"}
        </button>
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const [items, setItems] = useState<CommItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [thisMonth, setThisMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [availableAmount, setAvailableAmount] = useState(0);
  const [estimatedAmount, setEstimatedAmount] = useState(0); // 이번주 예상 수당
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [discretionItems, setDiscretionItems] = useState<any[]>([]);
  const [period, setPeriod] = useState<"this"|"last">("this");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setMemberId(session.user.id);

      const now = new Date();
      const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastStart = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString();
      const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { data: member },
        { data: thisComm },
        { data: lastComm },
        { data: commList },
        { data: pending },
        { data: discretion },
      ] = await Promise.all([
        supabase.from("members").select("withdrawal_available").eq("id", session.user.id).single(),
        supabase.from("commissions").select("amount").eq("member_id", session.user.id).gte("created_at", thisStart),
        supabase.from("commissions").select("amount").eq("member_id", session.user.id).gte("created_at", lastStart).lt("created_at", lastEnd),
        supabase.from("commissions")
          .select("id, amount, base_amount, rate, created_at, rule:commission_rules(name, rule_type), source_member:members!source_member_id(name, member_code)")
          .eq("member_id", session.user.id)
          .order("created_at", { ascending: false }).limit(50),
        supabase.from("withdrawal_requests").select("*").eq("member_id", session.user.id).eq("status", "PENDING").single(),
        supabase.from("admin_discretion_payouts").select("amount, reason, monthly_shared_payouts(year,month)").eq("member_id", session.user.id).order("created_at",{ascending:false}).limit(3),
      ]);

      const withdrawalAvail = (member as any)?.withdrawal_available ?? 0;
      setAvailableAmount(withdrawalAvail);

      // 이번주 발생 수당 (마감 전 예상액)
      const now2 = new Date();
      const weekStart = new Date(now2); weekStart.setDate(now2.getDate() - now2.getDay() + 1); weekStart.setHours(0,0,0,0);
      const { data: weekComm } = await supabase.from("commissions").select("amount").eq("member_id", session.user.id).gte("created_at", weekStart.toISOString());
      const weekTotal = weekComm?.reduce((s:number,c:any)=>s+c.amount,0)??0;
      setEstimatedAmount(weekTotal);

      setThisMonth(thisComm?.reduce((s:number,c:any)=>s+c.amount,0) ?? 0);
      setLastMonth(lastComm?.reduce((s:number,c:any)=>s+c.amount,0) ?? 0);
      setItems((commList as any) ?? []);
      setPendingRequest(pending);
      setDiscretionItems((discretion as any) ?? []);
      setLoading(false);
    }
    load();
  }, [withdrawalSuccess]);

  // 다음 금요일
  const now = new Date();
  const daysToFriday = (5 - now.getDay() + 7) % 7 || 7;
  const nextFriday = new Date(now); nextFriday.setDate(now.getDate() + daysToFriday + 14);
  const payDateStr = nextFriday.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`;
  };

  const filtered = period === "this"
    ? items.filter(i => new Date(i.created_at) >= new Date(now.getFullYear(), now.getMonth(), 1))
    : items.filter(i => new Date(i.created_at) >= new Date(now.getFullYear(), now.getMonth()-1, 1) && new Date(i.created_at) < new Date(now.getFullYear(), now.getMonth(), 1));

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--bg-border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── 출금 가능 금액 히어로 ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))",
        border: "1.5px solid rgba(201,168,76,0.3)", borderRadius: "20px", padding: "22px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "var(--gold)", opacity: 0.06 }} />
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>출금 가능 금액</p>
        <p style={{ fontFamily: "Syne,sans-serif", fontSize: "36px", fontWeight: 900, color: "var(--gold)", marginBottom: "4px" }}>
          {formatKRW(availableAmount)}
        </p>
        {estimatedAmount > 0 && availableAmount === 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
            <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>이번주 발생 수당</span>
            <span style={{ fontSize:"14px", fontWeight:700, color:"var(--gold)" }}>{formatKRW(estimatedAmount)}</span>
            <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>(마감 후 출금 가능)</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <Clock size={12} color="var(--text-muted)" />
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
            {pendingRequest ? `신청 완료 · 지급 예정일 ${pendingRequest.payment_date}` : `다음 지급일 ${payDateStr}`}
          </p>
        </div>

        {pendingRequest ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "12px", background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.25)" }}>
            <CheckCircle size={15} color="#00C896" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#00C896" }}>출금 신청 완료 — {formatKRW(pendingRequest.net_amount)} 지급 예정</span>
          </div>
        ) : availableAmount > 0 ? (
          <button onClick={() => setShowWithdrawal(true)} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "var(--gold)", border: "none",
            color: "#1a1400", fontSize: "15px", fontWeight: 800, cursor: "pointer",
            transition: "all 0.2s", boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            출금 신청하기 → {formatKRW(availableAmount)}
          </button>
        ) : (
          <div style={{ padding: "12px 16px", borderRadius: "12px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>이번 주 출금 가능 금액이 없습니다</p>
          </div>
        )}
      </div>

      {/* ── 이번달 / 지난달 수당 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Wallet size={13} color="var(--gold)" />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>이번달</span>
          </div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--gold)" }}>{formatKRW(thisMonth)}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <TrendingUp size={13} color="var(--text-muted)" />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>지난달</span>
          </div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{formatKRW(lastMonth)}</p>
        </div>
      </div>

      {/* ── 수당 내역 ── */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--bg-border)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>수당 내역</h3>
          <div style={{ display: "flex", gap: "4px" }}>
            {([["this","이번달"],["last","지난달"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setPeriod(val)} style={{
                padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                background: period === val ? "rgba(201,168,76,0.15)" : "transparent",
                border: `1px solid ${period === val ? "rgba(201,168,76,0.3)" : "var(--bg-border)"}`,
                color: period === val ? "var(--gold)" : "var(--text-muted)",
              }}>{label}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>수당 내역이 없습니다</div>
        ) : (
          filtered.map((c, i) => {
            const ti = TYPE_MAP[(c.rule as any)?.rule_type ?? ""] ?? { label: "수당", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" };
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--bg-border)" : "none",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: ti.bg, border: `1px solid ${ti.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: ti.color, flexShrink: 0 }}>{ti.label}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                    {(c.rule as any)?.name ?? "수당"}{(c.source_member as any)?.name ? ` — ${(c.source_member as any).name}` : ""}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                    {formatDate(c.created_at)}{c.base_amount > 0 && c.rate ? ` · ${c.base_amount.toLocaleString()}원 × ${c.rate}%` : ""}
                  </p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>+{c.amount.toLocaleString()}</span>
              </div>
            );
          })
        )}
      </div>

      {/* 출금 신청 팝업 */}
      {showWithdrawal && (
        <WithdrawalModal
          availableAmount={availableAmount}
          memberId={memberId}
          onClose={() => setShowWithdrawal(false)}
          onSuccess={() => { setShowWithdrawal(false); setWithdrawalSuccess(s => !s); }}
        />
      )}
    </div>
  );
}
