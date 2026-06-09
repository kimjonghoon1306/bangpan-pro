"use client";

// 위→아래 계층 다이어그램(조직도) 공용 컴포넌트
export interface OrgChartNode {
  id: string;
  name: string;
  rankLabel: string;
  color: string;
  sub?: string;        // 보조 텍스트 (예: "산하GV 2,000만")
  badge?: string;      // 우상단 뱃지 (예: "판권 30만")
  badgeColor?: string;
  isSelf?: boolean;
  children?: OrgChartNode[];
}

function NodeBox({ node }: { node: OrgChartNode }) {
  return (
    <div style={{
      position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
      padding: "10px 14px", borderRadius: "14px", minWidth: "92px",
      background: node.isSelf ? `${node.color}18` : "var(--bg-elevated)",
      border: `2px solid ${node.isSelf ? node.color : `${node.color}55`}`,
      boxShadow: node.isSelf ? `0 0 16px ${node.color}40` : "none",
    }}>
      {node.badge && (
        <span style={{
          position: "absolute", top: -10, right: -8,
          padding: "2px 7px", borderRadius: "999px", whiteSpace: "nowrap",
          fontSize: "9px", fontWeight: 800,
          background: node.badgeColor ?? node.color, color: "#fff",
        }}>{node.badge}</span>
      )}
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: `${node.color}22`, border: `2px solid ${node.color}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", fontWeight: 800, color: node.color,
      }}>{node.name[0]}</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", margin: 0, whiteSpace: "nowrap" }}>
          {node.name}{node.isSelf ? " (나)" : ""}
        </p>
        <span style={{
          display: "inline-block", padding: "0px 6px", borderRadius: "999px",
          fontSize: "9px", fontWeight: 700, background: `${node.color}22`, color: node.color,
        }}>{node.rankLabel}</span>
        {node.sub && <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: "2px 0 0", whiteSpace: "nowrap" }}>{node.sub}</p>}
      </div>
    </div>
  );
}

function ChartNode({ node }: { node: OrgChartNode }) {
  const kids = node.children ?? [];
  const has = kids.length > 0;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <NodeBox node={node} />

      {has && (
        <>
          {/* 부모 → 자식 묶음 연결 세로선 */}
          <div style={{ width: "2px", height: "18px", background: "var(--bg-border)" }} />

          {/* 자식들 가로 배치 */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {kids.map((c, i) => {
              const isFirst = i === 0;
              const isLast = i === kids.length - 1;
              const only = kids.length === 1;
              return (
                <div key={c.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px" }}>
                  {/* 상단 가로 연결선 (첫/막 노드는 한쪽만) */}
                  {!only && (
                    <div style={{ display: "flex", width: "100%", height: "18px" }}>
                      <div style={{ flex: 1, borderTop: isFirst ? "none" : "2px solid var(--bg-border)" }} />
                      <div style={{ width: "2px", background: "var(--bg-border)" }} />
                      <div style={{ flex: 1, borderTop: isLast ? "none" : "2px solid var(--bg-border)" }} />
                    </div>
                  )}
                  {only && <div style={{ width: "2px", height: "0px" }} />}
                  <ChartNode node={c} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartView({ root }: { root: OrgChartNode }) {
  return (
    <div style={{ width: "100%", overflowX: "auto", padding: "16px 8px 8px" }}>
      <div style={{ display: "flex", justifyContent: "center", minWidth: "min-content" }}>
        <ChartNode node={root} />
      </div>
    </div>
  );
}
