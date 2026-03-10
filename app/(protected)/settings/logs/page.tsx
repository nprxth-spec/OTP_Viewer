"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { AuthLog } from "@/lib/store";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/auth/logs", { cache: "no-store", credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  function formatTime(iso: string) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("th-TH");
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Log การเข้าสู่ระบบ
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: 14 }}>
          ประวัติการเข้าสู่ระบบและออกจากระบบของบัญชี
        </p>
      </div>

      <div style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span>กำลังโหลด...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Clock size={32} strokeWidth={1.5} opacity={0.5} />
            <span>ไม่มีประวัติการใช้งาน</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>เวลา</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>เหตุการณ์</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>สถานะ</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>IP Address</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-secondary)" }}>Browser</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--list-border)" }} className="transition-all hover:bg-[var(--bg-page)]">
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(log.time)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: log.action === "LOGIN" ? "var(--live-bg)" : "var(--border)",
                        color: log.action === "LOGIN" ? "var(--live-text)" : "var(--text-secondary)"
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {log.success ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontWeight: 500 }}>
                          <ShieldCheck size={16} /> สำเร็จ
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--error)", fontWeight: 500 }}>
                          <ShieldAlert size={16} /> ล้มเหลว
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 13 }}>
                      {log.ip}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.userAgent}>
                      {log.userAgent.split(" ")[0]}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style dangerouslySetInlineStyle={{ __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        tr:hover { background-color: var(--bg-page); }
      `}} />
    </div>
  );
}
