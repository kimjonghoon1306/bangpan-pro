"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatKRW } from "@/lib/utils";
import { decrypt } from "@/lib/crypto";
import { CheckCircle, XCircle, Clock, Download, Search, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Skeleton, SkeletonTable, SkeletonStyle } from "@/components/ui/Skeleton";

const STATUS_MAP: Record<string,{label:string;color:string;bg:string}> = {
  PENDING:  {label:"신청중",   color:"#FF9500",        bg:"rgba(255,149,0,0.1)"},
  APPROVED: {label:"승인",     color:"#6C47FF",        bg:"rgba(108,71,255,0.1)"},
  PAID:     {label:"지급완료", color:"#00C896",        bg:"rgba(0,200,150,0.1)"},
  REJECTED: {label:"거절",     color:"#F87171",        bg:"rgba(248,113,113,0.1)"},
};

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [showResident, setShowResident] = useState<Record<string,boolean>>({});
  const [decrypted, setDecrypted] = useState<Record<string,string>>({});
  const [processing, setProcessing] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string,string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string,boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    let q = supabase.from("withdrawal_requests")
      .select("*, member:members(id,name,member_code,phone,email)", {count:"exact"})
      .order("created_at",{ascending:false})
      .limit(100);
    if (statusFilter !== "ALL") q = q.eq("status", statusFilter);
    const {data, count} = await q;
    let filtered = (data as any[]) ?? [];
    if (search) filtered = filtered.filter((r:any) =>
      r.member?.name?.includes(search) ||
      r.member?.member_code?.includes(search) ||
      r.member?.phone?.includes(search) ||
      r.member?.email?.includes(search)
    );
    setRequests(filtered);
    setTotal(count ?? 0);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  // 주민번호 복호화 (API route 통해)
  async function fetchResident(id: string, memberId: string) {
    if (decrypted[id]) {
      setShowResident(s => ({...s, [id]: !s[id]}));
      return;
    }
    const res = await fetch(`/api/member/withdrawal?member_id=${memberId}`);
    const json = await res.json();
    if (json.masked) {
      setDecrypted(d => ({...d, [id]: json.masked}));
      setShowResident(s => ({...s, [id]: true}));
    }
  }

  async function handleApprove(id: string) {
    setProcessing(id);
    const supabase = createBrowserSupabaseClient();
    await supabase.from("withdrawal_requests").update({status:"APPROVED", approved_at: new Date().toISOString()}).eq("id", id);
    setProcessing(null);
    load();
  }

  async function handlePay(id: string) {
    setProcessing(id);
    const supabase = createBrowserSupabaseClient();
    await supabase.from("withdrawal_requests").update({status:"PAID", paid_at: new Date().toISOString()}).eq("id", id);
    setProcessing(null);
    load();
  }

  async function handleReject(id: string) {
    const reason = rejectReason[id];
    if (!reason) { alert("거절 사유를 입력해주세요"); return; }
    setProcessing(id);
    const supabase = createBrowserSupabaseClient();
    await supabase.from("withdrawal_requests").update({status:"REJECTED", rejected_reason: reason}).eq("id", id);
    setProcessing(null);
    setShowRejectInput(s => ({...s, [id]: false}));
    load();
  }

  function exportTSV() {
    const paidList = requests.filter(r => r.status === "APPROVED" || r.status === "PAID");
    const header = "이름\t회원번호\t전화번호\t이메일\t은행\t계좌번호\t예금주\t세전금액\t원천징수\t실지급액\t지급예정일\n";
    const rows = paidList.map(r =>
      `${r.member?.name}\t${r.member?.member_code}\t${r.member?.phone??""}\t${r.member?.email??""}\t${r.bank_name??""}\t${r.bank_account??""}\t${r.bank_holder??""}\t${r.amount}\t${r.tax_amount}\t${r.net_amount}\t${r.payment_date}`
    ).join("\n");
    const blob = new Blob(["\uFEFF"+header+rows], {type:"text/tab-separated-values;charset=utf-8"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`출금신청_${new Date().toISOString().split("T")[0]}.tsv`; a.click();
  }

  const totalNet = requests.filter(r=>r.status!=="REJECTED").reduce((s,r)=>s+r.net_amount,0);

  return (
    <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>
      <SkeletonStyle />

      {/* 헤더 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <h1 style={{fontFamily:"Syne,sans-serif",fontSize:"22px",fontWeight:800,color:"var(--text-primary)",margin:0}}>출금 신청 관리</h1>
          <p style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"2px"}}>회원 출금 신청 승인·거절·지급 처리</p>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={load} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 12px",borderRadius:"9px",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",color:"var(--text-secondary)",cursor:"pointer",fontSize:"13px"}}>
            <RefreshCw size={13}/> 새로고침
          </button>
          <button onClick={exportTSV} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"9px",background:"rgba(0,200,150,0.1)",border:"1px solid rgba(0,200,150,0.25)",color:"#00C896",cursor:"pointer",fontSize:"13px",fontWeight:600}}>
            <Download size={14}/> 은행 이체용 출력
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px"}}>
        {[
          {label:"신청중",   count:requests.filter(r=>r.status==="PENDING").length,  amount:requests.filter(r=>r.status==="PENDING").reduce((s,r)=>s+r.net_amount,0),  color:"#FF9500"},
          {label:"승인",     count:requests.filter(r=>r.status==="APPROVED").length, amount:requests.filter(r=>r.status==="APPROVED").reduce((s,r)=>s+r.net_amount,0), color:"#6C47FF"},
          {label:"지급완료", count:requests.filter(r=>r.status==="PAID").length,     amount:requests.filter(r=>r.status==="PAID").reduce((s,r)=>s+r.net_amount,0),     color:"#00C896"},
          {label:"거절",     count:requests.filter(r=>r.status==="REJECTED").length, amount:0,  color:"#F87171"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg-elevated)",border:`1px solid ${s.color}22`,borderRadius:"14px",padding:"14px"}}>
            <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"4px"}}>{s.label}</p>
            <p style={{fontFamily:"Syne,sans-serif",fontSize:"20px",fontWeight:800,color:s.color,marginBottom:"2px"}}>{s.count}건</p>
            {s.amount > 0 && <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{formatKRW(s.amount)}</p>}
          </div>
        ))}
      </div>

      {/* 필터 + 검색 */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"4px"}}>
          {["ALL","PENDING","APPROVED","PAID","REJECTED"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} style={{padding:"7px 14px",borderRadius:"9px",fontSize:"12px",fontWeight:600,cursor:"pointer",transition:"all 0.15s",background:statusFilter===s?`${STATUS_MAP[s]?.color??'var(--violet)'}18`:"var(--bg-elevated)",border:`1.5px solid ${statusFilter===s?(STATUS_MAP[s]?.color??"var(--violet)"):"var(--bg-border)"}`,color:statusFilter===s?(STATUS_MAP[s]?.color??"var(--violet)"):"var(--text-muted)"}}>
              {s==="ALL"?"전체":STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
        <div style={{position:"relative",flex:"1 1 200px"}}>
          <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",pointerEvents:"none"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름·회원번호·전화·이메일" className="input-base" style={{paddingLeft:"30px",fontSize:"13px"}}/>
        </div>
      </div>

      {/* 목록 */}
      {loading ? <SkeletonTable rows={5} cols={6}/> : requests.length === 0 ? (
        <div style={{background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",borderRadius:"16px",padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:"13px"}}>출금 신청이 없습니다</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {requests.map(r=>{
            const S = STATUS_MAP[r.status]??STATUS_MAP["PENDING"];
            const isProc = processing === r.id;
            return (
              <div key={r.id} style={{background:"var(--bg-elevated)",border:`1.5px solid ${r.status==="PENDING"?"rgba(255,149,0,0.2)":"var(--bg-border)"}`,borderRadius:"16px",padding:"18px",transition:"all 0.15s"}}>
                {/* 상단: 회원정보 + 상태 */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"14px",gap:"10px",flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:`${S.color}18`,border:`2px solid ${S.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:800,color:S.color,flexShrink:0}}>
                      {r.member?.name?.[0]??"?"}
                    </div>
                    <div>
                      <p style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",margin:0}}>{r.member?.name}</p>
                      <div style={{display:"flex",gap:"8px",marginTop:"2px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"11px",color:"var(--text-muted)",fontFamily:"monospace"}}>{r.member?.member_code}</span>
                        {r.member?.phone && <span style={{fontSize:"11px",color:"var(--text-muted)"}}>{r.member.phone}</span>}
                        {r.member?.email && <span style={{fontSize:"11px",color:"var(--text-muted)"}}>{r.member.email}</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{padding:"4px 12px",borderRadius:"999px",fontSize:"12px",fontWeight:700,background:S.bg,color:S.color,border:`1px solid ${S.color}33`}}>{S.label}</span>
                </div>

                {/* 금액 정보 */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"8px",marginBottom:"14px"}}>
                  {[
                    {label:"신청액 (세전)", value:formatKRW(r.amount),     color:"var(--text-primary)"},
                    {label:"원천징수 3.3%", value:`-${formatKRW(r.tax_amount)}`, color:"#F87171"},
                    {label:"실지급액",      value:formatKRW(r.net_amount),  color:"#6C47FF"},
                    {label:"지급 예정일",   value:r.payment_date,           color:"var(--text-secondary)"},
                  ].map(s=>(
                    <div key={s.label} style={{background:"var(--bg)",borderRadius:"10px",padding:"10px 12px"}}>
                      <p style={{fontSize:"10px",color:"var(--text-muted)",marginBottom:"3px"}}>{s.label}</p>
                      <p style={{fontSize:"14px",fontWeight:700,color:s.color,fontFamily:"Syne,sans-serif"}}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* 계좌 + 주민번호 */}
                <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"14px",padding:"10px 14px",background:"var(--bg)",borderRadius:"10px"}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"2px"}}>입금 계좌</p>
                    <p style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{r.bank_name} {r.bank_account} ({r.bank_holder})</p>
                  </div>
                  {r.resident_number_enc && (
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <div>
                        <p style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"2px"}}>주민번호</p>
                        <p style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)",fontFamily:"monospace"}}>
                          {showResident[r.id] ? (decrypted[r.id] ?? "불러오는 중...") : "●●●●●●-●●●●●●●"}
                        </p>
                      </div>
                      <button onClick={()=>fetchResident(r.id, r.member?.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:"4px"}}>
                        {showResident[r.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                {r.status === "PENDING" && (
                  <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                    <button onClick={()=>handleApprove(r.id)} disabled={isProc} style={{display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",borderRadius:"10px",background:"rgba(108,71,255,0.1)",border:"1px solid rgba(108,71,255,0.3)",color:"#6C47FF",cursor:"pointer",fontSize:"13px",fontWeight:700,flex:1,justifyContent:"center"}}>
                      {isProc ? <RefreshCw size={14} style={{animation:"spin 0.8s linear infinite"}}/> : <CheckCircle size={14}/>} 승인
                    </button>
                    <button onClick={()=>setShowRejectInput(s=>({...s,[r.id]:!s[r.id]}))} style={{display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",borderRadius:"10px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#F87171",cursor:"pointer",fontSize:"13px",fontWeight:700,flex:1,justifyContent:"center"}}>
                      <XCircle size={14}/> 거절
                    </button>
                    {showRejectInput[r.id] && (
                      <div style={{width:"100%",display:"flex",gap:"8px"}}>
                        <input value={rejectReason[r.id]??""} onChange={e=>setRejectReason(s=>({...s,[r.id]:e.target.value}))} placeholder="거절 사유 입력" className="input-base" style={{flex:1,fontSize:"13px"}}/>
                        <button onClick={()=>handleReject(r.id)} style={{padding:"8px 16px",borderRadius:"9px",background:"#F87171",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",fontWeight:700,whiteSpace:"nowrap"}}>확인</button>
                      </div>
                    )}
                  </div>
                )}
                {r.status === "APPROVED" && (
                  <button onClick={()=>handlePay(r.id)} disabled={isProc} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"12px",borderRadius:"12px",background:"linear-gradient(135deg,#00C896,#00A882)",border:"none",color:"#fff",cursor:"pointer",fontSize:"14px",fontWeight:800}}>
                    {isProc ? <RefreshCw size={15} style={{animation:"spin 0.8s linear infinite"}}/> : <CheckCircle size={15}/>} 지급 처리 완료
                  </button>
                )}
                {r.status === "REJECTED" && r.rejected_reason && (
                  <p style={{fontSize:"12px",color:"#F87171",padding:"8px 12px",background:"rgba(248,113,113,0.08)",borderRadius:"8px"}}>거절 사유: {r.rejected_reason}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

