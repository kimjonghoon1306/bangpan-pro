"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, X, Users, Wallet,
  CheckCircle, Clock, Download, HelpCircle, BookOpen,
  TrendingUp, Calendar, Zap, AlertCircle,
} from "lucide-react";
import useSWR from "swr";
import { fetchCalendarMonth } from "@/lib/fetchers";
import { Skeleton, SkeletonStyle } from "@/components/ui/Skeleton";

// ─── 유틸 ──────────────────────────────────────────────
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
  const end = new Date(friday); end.setDate(friday.getDate() - 1); // 목요일
  const start = new Date(end); start.setDate(end.getDate() - 6);   // 2주 전 금요일~목요일
  const twoWeeksBefore = new Date(friday); twoWeeksBefore.setDate(friday.getDate() - 14);
  const twoWeeksBeforeEnd = new Date(twoWeeksBefore); twoWeeksBeforeEnd.setDate(twoWeeksBefore.getDate() + 6);
  return { start: twoWeeksBefore, end: twoWeeksBeforeEnd };
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function toDateStr(d: Date) { return d.toISOString().split("T")[0]; }

// ─── 기본 수당률 ────────────────────────────────────────
const DEFAULT_RATES: Record<number,{s:number,r:number,o:number}> = {
  1:{s:25,r:5,o:0}, 2:{s:28,r:7,o:3}, 3:{s:32,r:10,o:8}
};

// ─── 사용 가이드 모달 ──────────────────────────────────
const GUIDE_ITEMS = [
  { icon: Calendar, color: "#FF2D78", bg: "rgba(255,45,120,0.10)", title: "캘린더 보기",
    desc: "이번달 달력에서 매주 금요일 지급 예정 현황을 한눈에 확인합니다.",
    steps: ["매주 금요일에 핑크색으로 지급일 뱃지가 자동 표시됩니다","뱃지에 예상 지급 인원과 금액이 미리 표시됩니다","이전/다음 달 화살표로 월 이동 가능합니다","마감 완료된 날짜는 초록 점으로 표시됩니다"] },
  { icon: Zap, color: "#FF2D78", bg: "rgba(255,45,120,0.10)", title: "금요일 클릭",
    desc: "금요일을 클릭하면 해당 주 지급 예정 명단 전체를 확인할 수 있습니다.",
    steps: ["금요일 칸 클릭 → 팝업 오픈","지급 대상 회원 이름·직급·금액·계좌 상세 표시","이름·전화·이메일·계좌 포함 출력 가능","지급 완료된 주는 '완료' 표시로 구분됩니다"] },
  { icon: TrendingUp, color: "#FF2D78", bg: "rgba(255,45,120,0.10)", title: "자동 계산 원리",
    desc: "금요일 클릭 시 2주 전 해당 주 매출을 자동으로 불러와 계산합니다.",
    steps: ["이번주 금요일 = 2주 전(월~일) 매출 기준","판매수당·추천수당·오버라이딩 자동 계산","마감·정산 페이지의 주간 정산과 동일한 계산 방식","미래 금요일은 현재까지 매출 기준 예상치 표시"] },
  { icon: AlertCircle, color: "#FF9500", bg: "rgba(255,149,0,0.10)", title: "활용 방법",
    desc: "캘린더로 미리 준비하고 정산 페이지에서 확정 처리합니다.",
    steps: ["캘린더에서 이번주 금요일 클릭 → 명단·금액 미리 확인","은행 이체 준비 (계좌·금액 확인)","마감·정산 페이지에서 주간 정산 실행 → 확정 처리","캘린더에서 완료 표시 확인"] },
];

function CalendarGuideModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.2s ease" }} onClick={onClose}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}} @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:"680px", maxHeight:"90vh", overflowY:"auto", background:"var(--bg-elevated)", borderRadius:"24px", border:"1.5px solid rgba(255,45,120,0.3)", boxShadow:"0 24px 80px rgba(255,45,120,0.25)", animation:"slideUp 0.25s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 24px", borderBottom:"1px solid var(--bg-border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:36, height:36, borderRadius:"10px", background:"rgba(255,45,120,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={18} color="#FF2D78" />
            </div>
            <div>
              <p style={{ fontSize:"16px", fontWeight:800, color:"var(--text-primary)", margin:0 }}>캘린더 사용 가이드</p>
              <p style={{ fontSize:"11px", color:"var(--text-muted)", margin:0 }}>지급 예정 현황 미리보기</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", background:"var(--bg)", border:"1px solid var(--bg-border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)" }}><X size={15}/></button>
        </div>
        <div style={{ display:"flex", gap:"6px", padding:"16px 24px 0", overflowX:"auto", flexWrap:"wrap" }}>
          {GUIDE_ITEMS.map((g,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"10px", whiteSpace:"nowrap", background: active===i ? g.bg : "transparent", border:`1.5px solid ${active===i ? g.color : "var(--bg-border)"}`, color: active===i ? g.color : "var(--text-muted)", cursor:"pointer", fontSize:"12px", fontWeight:600, transition:"all 0.15s" }}>
              <g.icon size={13}/>{g.title}
            </button>
          ))}
        </div>
        <div style={{ padding:"20px 24px 24px" }}>
          {GUIDE_ITEMS.map((g,i)=>active!==i?null:(
            <div key={i} style={{ animation:"slideUp 0.2s ease" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:"14px", padding:"18px", borderRadius:"16px", background:g.bg, border:`1px solid ${g.color}33`, marginBottom:"18px" }}>
                <div style={{ width:44, height:44, borderRadius:"12px", background:g.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><g.icon size={22} color="#fff"/></div>
                <div>
                  <p style={{ fontSize:"15px", fontWeight:700, color:g.color, margin:"0 0 4px" }}>{g.title}</p>
                  <p style={{ fontSize:"13px", color:"var(--text-secondary)", margin:0, lineHeight:1.6 }}>{g.desc}</p>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {g.steps.map((step,si)=>(
                  <div key={si} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 16px", borderRadius:"12px", background:"var(--bg)", border:"1px solid var(--bg-border)" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:g.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800, color:"#fff", flexShrink:0 }}>{si+1}</div>
                    <p style={{ fontSize:"13px", color:"var(--text-primary)", margin:0, lineHeight:1.6 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 지급 상세 팝업 ─────────────────────────────────────
function PaymentDetailModal({ friday, onClose }: { friday: Date; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paidStatus, setPaidStatus] = useState(false);

  const { start, end } = getPayWeek(friday);
  const payDateStr = friday.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"});
  const periodStr = `${toDateStr(start)} ~ ${toDateStr(end)}`;

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();

      // 이미 지급 완료 여부
      const { data: ws } = await supabase.from("weekly_settlements")
        .select("*").eq("payment_date", toDateStr(friday)).single();
      if (ws?.status === "PAID") { setPaidStatus(true); }

      // 해당 기간 주문 계산
      const { data: orders } = await supabase.from("orders")
        .select("id, member_id, total_bv, total_price")
        .eq("status","PAID")
        .gte("paid_at", toDateStr(start)+"T00:00:00")
        .lte("paid_at", toDateStr(end)+"T23:59:59");

      const { data: rules } = await supabase.from("commission_rules")
        .select("*, tiers:commission_tiers(rank_level,rate)").eq("is_active",true);
      const rList = (rules as any[]) ?? [];

      const { data: members } = await supabase.from("members")
        .select("id, name, member_code, phone, email, sponsor_id, rank:ranks(level,name,color), bank_name, bank_account, bank_holder")
        .eq("is_admin",false);
      const mMap: Record<string,any> = {};
      (members??[]).forEach((m:any)=>{ mMap[m.id]=m; });

      const calc: Record<string,any> = {};
      for (const order of orders??[]) {
        const m = mMap[order.member_id]; if(!m) continue;
        const lv = m.rank?.level??1;
        if (!calc[order.member_id]) calc[order.member_id]={name:m.name,code:m.member_code,phone:m.phone??"",email:m.email??"",rank:m.rank,bank:m.bank_name,account:m.bank_account,holder:m.bank_holder,sales:0,ref:0,over:0};
        const sRate = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===0&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===lv)?.rate??DEFAULT_RATES[lv]?.s??25;
        calc[order.member_id].sales += Math.floor(order.total_bv*sRate/100);
        const sid = m.sponsor_id;
        if (sid && mMap[sid]) {
          const sl = mMap[sid].rank?.level??1;
          if (!calc[sid]) calc[sid]={name:mMap[sid].name,code:mMap[sid].member_code,phone:mMap[sid].phone??"",email:mMap[sid].email??"",rank:mMap[sid].rank,bank:mMap[sid].bank_name,account:mMap[sid].bank_account,holder:mMap[sid].bank_holder,sales:0,ref:0,over:0};
          const rRate = rList.find((r:any)=>r.rule_type==="REFERRAL"&&r.target_depth_from===1&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===sl)?.rate??DEFAULT_RATES[sl]?.r??5;
          calc[sid].ref += Math.floor(order.total_bv*rRate/100);
          const gid = mMap[sid]?.sponsor_id;
          if (gid && mMap[gid]) {
            const gl = mMap[gid].rank?.level??1;
            if (gl>=2) {
              if (!calc[gid]) calc[gid]={name:mMap[gid].name,code:mMap[gid].member_code,phone:mMap[gid].phone??"",email:mMap[gid].email??"",rank:mMap[gid].rank,bank:mMap[gid].bank_name,account:mMap[gid].bank_account,holder:mMap[gid].bank_holder,sales:0,ref:0,over:0};
              const oRate = rList.find((r:any)=>r.rule_type==="TEAM"&&!r.is_volume_only)?.tiers?.find((t:any)=>t.rank_level===gl)?.rate??DEFAULT_RATES[gl]?.o??0;
              calc[gid].over += Math.floor(order.total_bv*oRate/100);
            }
          }
        }
      }
      const res = Object.entries(calc).map(([id,v]:any)=>{ const gross=v.sales+v.ref+v.over; return {...v, id, gross, tax:Math.floor(gross*0.033), net:Math.floor(gross*0.967)}; }).filter(r=>r.gross>0).sort((a,b)=>b.gross-a.gross);
      setResult(res);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = result.filter(r => !search || r.name.includes(search) || r.code.includes(search) || r.phone?.includes(search) || r.email?.includes(search));
  const totalNet = filtered.reduce((s,r)=>s+r.net,0);

  function handleExport() {
    const header = "이름\t회원번호\t전화번호\t이메일\t직급\t판매수당\t추천수당\t오버라이딩\t세전합계\t원천징수\t실지급액\t은행\t계좌번호\t예금주\n";
    const rows = filtered.map(r=>`${r.name}\t${r.code}\t${r.phone}\t${r.email}\t${r.rank?.name}\t${r.sales}\t${r.ref}\t${r.over}\t${r.gross}\t${r.tax}\t${r.net}\t${r.bank??""}\t${r.account??""}\t${r.holder??""}`).join("\n");
    const blob = new Blob(["\uFEFF"+header+rows],{type:"text/tab-separated-values;charset=utf-8"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`지급명세_${toDateStr(friday)}.tsv`; a.click();
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", overflowY:"auto" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:"900px", background:"var(--bg-elevated)", borderRadius:"24px", border:"1.5px solid rgba(255,45,120,0.3)", boxShadow:"0 24px 80px rgba(255,45,120,0.2)", overflow:"hidden", animation:"slideUp2 0.25s ease", marginTop:"auto", marginBottom:"auto" }}>
        <style>{`@keyframes slideUp2{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* 헤더 */}
        <div style={{ background:"linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.05))", borderBottom:"1px solid rgba(255,45,120,0.2)", padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                {paidStatus
                  ? <span style={{ padding:"3px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:800, background:"rgba(0,200,150,0.15)", color:"#00C896", border:"1px solid rgba(0,200,150,0.3)" }}>✓ 지급 완료</span>
                  : <span style={{ padding:"3px 10px", borderRadius:"999px", fontSize:"11px", fontWeight:800, background:"rgba(255,45,120,0.15)", color:"#FF2D78", border:"1px solid rgba(255,45,120,0.3)", animation:"pinkPulse 2s infinite" }}>💰 지급 예정</span>
                }
              </div>
              <h2 style={{ fontFamily:"Syne,sans-serif", fontSize:"22px", fontWeight:900, color:"var(--text-primary)", margin:"0 0 4px" }}>
                {payDateStr} 지급
              </h2>
              <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>정산 기간: {periodStr}</p>
            </div>
            <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", background:"var(--bg)", border:"1px solid var(--bg-border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)", flexShrink:0 }}><X size={16}/></button>
          </div>

          {/* 요약 */}
          {!loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"10px", marginTop:"16px" }}>
              {[
                {label:"지급 대상", value:`${filtered.length}명`, color:"#FF2D78"},
                {label:"총 지급액 (세후)", value:formatKRW(totalNet), color:"#FF2D78"},
                {label:"총 세전 합계", value:formatKRW(filtered.reduce((s,r)=>s+r.gross,0)), color:"var(--text-primary)"},
                {label:"원천징수 합계", value:formatKRW(filtered.reduce((s,r)=>s+r.tax,0)), color:"#F87171"},
              ].map(s=>(
                <div key={s.label} style={{ padding:"12px 14px", borderRadius:"12px", background:"rgba(0,0,0,0.15)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginBottom:"3px" }}>{s.label}</p>
                  <p style={{ fontFamily:"Syne,sans-serif", fontSize:"17px", fontWeight:800, color:s.color, margin:0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 검색 + 출력 */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--bg-border)", display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름·회원번호·전화·이메일 검색" className="input-base" style={{ flex:"1 1 200px", fontSize:"13px" }} />
          <button onClick={handleExport} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 16px", borderRadius:"10px", background:"rgba(255,45,120,0.1)", border:"1px solid rgba(255,45,120,0.3)", color:"#FF2D78", cursor:"pointer", fontSize:"13px", fontWeight:700, whiteSpace:"nowrap" }}>
            <Download size={14}/> 은행 이체용 출력
          </button>
        </div>

        {/* 명단 테이블 */}
        <div style={{ maxHeight:"50vh", overflowY:"auto" }}>
          {loading ? (
            <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)", fontSize:"13px" }}>
              <div style={{ width:28, height:28, border:"3px solid var(--bg-border)", borderTopColor:"#FF2D78", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 10px" }}/>
              계산 중...
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)", fontSize:"13px" }}>해당 기간 지급 대상이 없습니다</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"850px" }}>
                <thead style={{ position:"sticky", top:0, background:"var(--bg-elevated)", zIndex:1 }}>
                  <tr style={{ borderBottom:"2px solid rgba(255,45,120,0.2)" }}>
                    {["#","이름","전화번호","이메일","직급","판매수당","추천수당","오버라이딩","세전","세후 실지급","계좌"].map(h=>(
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:"11px", color:"var(--text-muted)", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r,i)=>(
                    <tr key={r.id} style={{ borderBottom:"1px solid var(--bg-border)", background: i%2===0 ? "transparent" : "rgba(255,45,120,0.02)", transition:"background 0.1s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,45,120,0.05)"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=i%2===0?"transparent":"rgba(255,45,120,0.02)"}
                    >
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"var(--text-muted)", fontWeight:600 }}>{i+1}</td>
                      <td style={{ padding:"11px 12px" }}>
                        <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)", margin:0 }}>{r.name}</p>
                        <p style={{ fontSize:"10px", color:"var(--text-muted)", margin:0, fontFamily:"monospace" }}>{r.code}</p>
                      </td>
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"var(--text-secondary)", whiteSpace:"nowrap" }}>{r.phone||"-"}</td>
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"var(--text-secondary)", whiteSpace:"nowrap" }}>{r.email||"-"}</td>
                      <td style={{ padding:"11px 12px" }}>
                        <span style={{ padding:"2px 8px", borderRadius:"999px", fontSize:"11px", fontWeight:600, background:`${r.rank?.color}22`, color:r.rank?.color, whiteSpace:"nowrap" }}>{r.rank?.name}</span>
                      </td>
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"#4FA3E8", fontWeight:500, whiteSpace:"nowrap" }}>{formatKRW(r.sales)}</td>
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"#FF9500", fontWeight:500, whiteSpace:"nowrap" }}>{formatKRW(r.ref)}</td>
                      <td style={{ padding:"11px 12px", fontSize:"12px", color:"#E8599A", fontWeight:500, whiteSpace:"nowrap" }}>{formatKRW(r.over)}</td>
                      <td style={{ padding:"11px 12px", fontSize:"13px", fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap" }}>{formatKRW(r.gross)}</td>
                      <td style={{ padding:"11px 12px", fontSize:"14px", fontWeight:900, color:"#FF2D78", whiteSpace:"nowrap" }}>{formatKRW(r.net)}</td>
                      <td style={{ padding:"11px 12px", fontSize:"11px", color:"var(--text-muted)", whiteSpace:"nowrap" }}>{r.bank} {r.account}<br/>{r.holder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--bg-border)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,45,120,0.03)" }}>
          <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>{filtered.length}명 · 세후 총 {formatKRW(totalNet)}</span>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:"10px", background:"var(--bg)", border:"1px solid var(--bg-border)", color:"var(--text-secondary)", cursor:"pointer", fontSize:"13px" }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 캘린더 페이지 ─────────────────────────────────
export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedFriday, setSelectedFriday] = useState<Date|null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [closingDates, setClosingDates] = useState<Set<string>>(new Set());
  const [paidFridays, setPaidFridays] = useState<Set<string>>(new Set());
  const [fridayStats, setFridayStats] = useState<Record<string,{count:number,amount:number}>>({}); 
  // statsLoading은 useSWR에서 관리

  const fridays = getFridays(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const DAYS = ["일","월","화","수","목","금","토"];
  const todayStr = toDateStr(now);

  // SWR로 한달치 데이터 한번에 가져오기
  const { data: calData, isLoading: statsLoading } = useSWR(
    `calendar-${year}-${month}`,
    () => fetchCalendarMonth(year, month),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!calData) return;
    setClosingDates(new Set(calData.closings.map((c:any)=>c.closing_date)));
    setPaidFridays(new Set(calData.settlements.filter((s:any)=>s.status==="PAID").map((s:any)=>s.payment_date)));

    // 클라이언트에서 금요일별 집계 (쿼리 없음)
    const stats: Record<string,{count:number,amount:number}> = {};
    for (const fri of fridays) {
      const { start, end } = getPayWeek(fri);
      const friOrders = calData.orders.filter((o:any)=>{
        const d = o.paid_at?.split("T")[0]??"";
        return d >= toDateStr(start) && d <= toDateStr(end);
      });
      const totalBv = friOrders.reduce((s:number,o:any)=>s+o.total_bv,0);
      stats[toDateStr(fri)] = { count: friOrders.length, amount: Math.floor(totalBv * 0.30) };
    }
    setFridayStats(stats);
  }, [calData, year, month]);

  function prevMonth() { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); }
  function nextMonth() { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); }

  const monthName = new Date(year, month).toLocaleDateString("ko-KR",{year:"numeric",month:"long"});

  return (
    <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"16px" }}>
      <style>{`
        @keyframes pinkPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,45,120,0.5); }
          60%  { box-shadow: 0 0 0 10px rgba(255,45,120,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,45,120,0); }
        }
        @keyframes fridayGlow {
          0%,100% { box-shadow: 0 0 12px rgba(255,45,120,0.3); }
          50%     { box-shadow: 0 0 24px rgba(255,45,120,0.6); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* 헤더 */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:44, height:44, borderRadius:"14px", background:"linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,45,120,0.05))", border:"1.5px solid rgba(255,45,120,0.4)", display:"flex", alignItems:"center", justifyContent:"center", animation:"pinkPulse 3s infinite" }}>
            <Calendar size={22} color="#FF2D78"/>
          </div>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:"24px", fontWeight:900, color:"var(--text-primary)", margin:0 }}>지급 캘린더</h1>
            <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>매주 금요일 수당 지급 현황</p>
          </div>
          <button onClick={()=>setShowGuide(true)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"999px", background:"linear-gradient(135deg,rgba(255,45,120,0.15),rgba(255,45,120,0.08))", border:"1.5px solid rgba(255,45,120,0.35)", color:"#FF2D78", cursor:"pointer", fontSize:"12px", fontWeight:700, animation:"pinkPulse 2s infinite", transition:"all 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,45,120,0.2)";(e.currentTarget as HTMLElement).style.animation="none";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="linear-gradient(135deg,rgba(255,45,120,0.15),rgba(255,45,120,0.08))";(e.currentTarget as HTMLElement).style.animation="pinkPulse 2s infinite";}}
          >
            <HelpCircle size={14}/> 사용 가이드
          </button>
        </div>

        {/* 월 이동 */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <button onClick={prevMonth} style={{ width:36, height:36, borderRadius:"50%", background:"var(--bg-elevated)", border:"1px solid var(--bg-border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-secondary)", transition:"all 0.15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,45,120,0.4)";(e.currentTarget as HTMLElement).style.color="#FF2D78";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--bg-border)";(e.currentTarget as HTMLElement).style.color="var(--text-secondary)";}}
          ><ChevronLeft size={16}/></button>
          <span style={{ fontFamily:"Syne,sans-serif", fontSize:"18px", fontWeight:800, color:"var(--text-primary)", minWidth:"130px", textAlign:"center" }}>{monthName}</span>
          <button onClick={nextMonth} style={{ width:36, height:36, borderRadius:"50%", background:"var(--bg-elevated)", border:"1px solid var(--bg-border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-secondary)", transition:"all 0.15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,45,120,0.4)";(e.currentTarget as HTMLElement).style.color="#FF2D78";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--bg-border)";(e.currentTarget as HTMLElement).style.color="var(--text-secondary)";}}
          ><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* 이번달 금요일 요약 카드 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:"10px" }}>
        {fridays.map(fri=>{
          const ds = toDateStr(fri);
          const isPast = fri < now;
          const isToday = isSameDay(fri, now);
          const isPaid = paidFridays.has(ds);
          const stats = fridayStats[ds];
          const isFuture = fri > now;
          return (
            <button key={ds} onClick={()=>setSelectedFriday(fri)} style={{
              padding:"16px", borderRadius:"16px", textAlign:"left", cursor:"pointer",
              background: isPaid ? "rgba(0,200,150,0.08)" : isToday ? "rgba(255,45,120,0.1)" : isFuture ? "rgba(255,45,120,0.05)" : "var(--bg-elevated)",
              border: isPaid ? "1.5px solid rgba(0,200,150,0.3)" : isToday ? "2px solid rgba(255,45,120,0.5)" : "1.5px solid rgba(255,45,120,0.2)",
              animation: isToday ? "pinkPulse 2s infinite" : "none",
              transition:"all 0.2s",
            }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=isPaid?"rgba(0,200,150,0.12)":"rgba(255,45,120,0.12)";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=isPaid?"rgba(0,200,150,0.08)":isToday?"rgba(255,45,120,0.1)":isFuture?"rgba(255,45,120,0.05)":"var(--bg-elevated)";(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"13px", fontWeight:700, color: isPaid ? "#00C896" : "#FF2D78" }}>
                  {fri.toLocaleDateString("ko-KR",{month:"numeric",day:"numeric"})} 금요일
                </span>
                {isPaid
                  ? <span style={{ fontSize:"10px", fontWeight:800, color:"#00C896", padding:"2px 7px", background:"rgba(0,200,150,0.15)", borderRadius:"999px" }}>완료</span>
                  : isToday
                  ? <span style={{ fontSize:"10px", fontWeight:800, color:"#FF2D78", padding:"2px 7px", background:"rgba(255,45,120,0.15)", borderRadius:"999px", animation:"pinkPulse 2s infinite" }}>오늘</span>
                  : isFuture
                  ? <span style={{ fontSize:"10px", fontWeight:800, color:"#FF9500", padding:"2px 7px", background:"rgba(255,149,0,0.15)", borderRadius:"999px" }}>예정</span>
                  : <span style={{ fontSize:"10px", fontWeight:800, color:"var(--text-muted)", padding:"2px 7px", background:"var(--bg-border)", borderRadius:"999px" }}>지난주</span>
                }
              </div>
              {statsLoading ? (
                <div style={{ height:32, display:"flex", alignItems:"center" }}>
                  <div style={{ width:16, height:16, border:"2px solid rgba(255,45,120,0.2)", borderTopColor:"#FF2D78", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                </div>
              ) : stats?.amount > 0 ? (
                <>
                  <p style={{ fontFamily:"Syne,sans-serif", fontSize:"18px", fontWeight:900, color: isPaid ? "#00C896" : "#FF2D78", margin:"0 0 2px" }}>{formatKRW(stats.amount)}</p>
                  <p style={{ fontSize:"11px", color:"var(--text-muted)", margin:0 }}>예상 · 클릭해서 명단 확인</p>
                </>
              ) : (
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>해당 기간 매출 없음</p>
              )}
            </button>
          );
        })}
      </div>

      {/* 달력 */}
      <div style={{ background:"var(--bg-elevated)", border:"1.5px solid rgba(255,45,120,0.15)", borderRadius:"20px", overflow:"hidden" }}>
        {/* 요일 헤더 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid var(--bg-border)" }}>
          {DAYS.map((d,i)=>(
            <div key={d} style={{ padding:"12px 0", textAlign:"center", fontSize:"12px", fontWeight:700, color: i===5 ? "#FF2D78" : i===0 ? "#4FA3E8" : "var(--text-muted)" }}>{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {Array.from({length: firstDay}).map((_,i)=>(
            <div key={`e${i}`} style={{ minHeight:"90px", borderRight:"1px solid var(--bg-border)", borderBottom:"1px solid var(--bg-border)" }}/>
          ))}
          {Array.from({length: daysInMonth}).map((_,i)=>{
            const day = i+1;
            const d = new Date(year, month, day);
            const ds = toDateStr(d);
            const isFri = d.getDay()===5;
            const isSun = d.getDay()===0;
            const isToday2 = ds === todayStr;
            const hasClosed = closingDates.has(ds);
            const isPaid = paidFridays.has(ds);
            const stats = fridayStats[ds];
            const isFutureFri = isFri && d > now;

            return (
              <div key={day} onClick={isFri ? ()=>setSelectedFriday(d) : undefined} style={{
                minHeight:"90px", padding:"8px",
                borderRight:"1px solid var(--bg-border)", borderBottom:"1px solid var(--bg-border)",
                background: isFri ? (isPaid ? "rgba(0,200,150,0.05)" : "rgba(255,45,120,0.04)") : "transparent",
                cursor: isFri ? "pointer" : "default",
                position:"relative", transition:"background 0.15s",
              }}
                onMouseEnter={isFri ? e=>(e.currentTarget as HTMLElement).style.background=isPaid?"rgba(0,200,150,0.1)":"rgba(255,45,120,0.1)" : undefined}
                onMouseLeave={isFri ? e=>(e.currentTarget as HTMLElement).style.background=isFri?(isPaid?"rgba(0,200,150,0.05)":"rgba(255,45,120,0.04)"):"transparent" : undefined}
              >
                {/* 날짜 번호 */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                  <span style={{
                    width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", fontWeight: isToday2 ? 900 : 500,
                    background: isToday2 ? "#FF2D78" : "transparent",
                    color: isToday2 ? "#fff" : isFri ? "#FF2D78" : isSun ? "#4FA3E8" : "var(--text-primary)",
                    boxShadow: isToday2 ? "0 2px 8px rgba(255,45,120,0.5)" : "none",
                  }}>{day}</span>
                  {hasClosed && <span style={{ width:7, height:7, borderRadius:"50%", background:"#00C896", display:"inline-block" }} title="마감 완료"/>}
                </div>

                {/* 금요일 지급 정보 */}
                {isFri && (
                  <div style={{ marginTop:"4px" }}>
                    {isPaid ? (
                      <div style={{ padding:"4px 6px", borderRadius:"7px", background:"rgba(0,200,150,0.12)", border:"1px solid rgba(0,200,150,0.25)" }}>
                        <p style={{ fontSize:"9px", fontWeight:700, color:"#00C896", margin:"0 0 1px" }}>✓ 지급 완료</p>
                      </div>
                    ) : statsLoading ? (
                      <div style={{ padding:"4px 6px", borderRadius:"7px", background:"rgba(255,45,120,0.06)" }}>
                        <div style={{ width:12, height:12, border:"2px solid rgba(255,45,120,0.2)", borderTopColor:"#FF2D78", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                      </div>
                    ) : stats?.amount > 0 ? (
                      <div style={{ padding:"5px 7px", borderRadius:"8px", background:"rgba(255,45,120,0.1)", border:"1px solid rgba(255,45,120,0.25)", animation: isFutureFri ? "fridayGlow 3s infinite" : "none" }}>
                        <p style={{ fontSize:"9px", fontWeight:700, color:"#FF2D78", margin:"0 0 2px" }}>💰 지급일</p>
                        <p style={{ fontFamily:"Syne,sans-serif", fontSize:"11px", fontWeight:900, color:"#FF2D78", margin:0 }}>
                          {stats.amount >= 1000000 ? `${(stats.amount/10000).toFixed(0)}만` : formatKRW(stats.amount)}
                        </p>
                      </div>
                    ) : (
                      <div style={{ padding:"4px 6px", borderRadius:"7px", background:"rgba(255,45,120,0.05)", border:"1px solid rgba(255,45,120,0.1)" }}>
                        <p style={{ fontSize:"9px", color:"rgba(255,45,120,0.5)", margin:0 }}>지급일</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", padding:"12px 16px", borderRadius:"12px", background:"var(--bg-elevated)", border:"1px solid var(--bg-border)" }}>
        {[
          {color:"#FF2D78", bg:"rgba(255,45,120,0.12)", label:"금요일 지급일 (예정)"},
          {color:"#00C896", bg:"rgba(0,200,150,0.12)", label:"지급 완료"},
          {color:"#00C896", bg:"transparent", label:"● 일일 마감 완료", dot:true},
          {color:"#FF2D78", bg:"transparent", label:"오늘", circle:true},
        ].map(s=>(
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            {s.dot ? <span style={{ width:8, height:8, borderRadius:"50%", background:s.color }} />
             : s.circle ? <span style={{ width:20, height:20, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#fff", fontWeight:800 }}>1</span>
             : <span style={{ width:14, height:14, borderRadius:"4px", background:s.bg, border:`1.5px solid ${s.color}`, display:"inline-block" }}/>}
            <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {selectedFriday && <PaymentDetailModal friday={selectedFriday} onClose={()=>setSelectedFriday(null)} />}
      {showGuide && <CalendarGuideModal onClose={()=>setShowGuide(false)} />}
    </div>
  );
}
