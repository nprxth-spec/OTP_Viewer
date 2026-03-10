"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Globe, LogOut, Info, Clock } from "lucide-react";
import type { Session } from "@/lib/store";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/auth/sessions", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleClearOthers() {
    if (!confirm("คุณต้องการล้างเซสชั่นอุปกรณ์อื่นทั้งหมดหรือไม่? (อุปกรณ์อื่นจะถูกออกจากระบบทันที)")) return;
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("ล้างเซสชั่นอื่นเรียบร้อยแล้ว");
        fetchSessions();
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  }

  function formatTime(iso: string) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("th-TH");
  }

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone size={24} className="text-secondary" strokeWidth={1.5} />;
    }
    return <Monitor size={24} className="text-secondary" strokeWidth={1.5} />;
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            เซสชั่น (Sessions)
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: 14 }}>
            อุปกรณ์และเบราว์เซอร์ที่กำลังเข้าสู่ระบบบัญชีของคุณ
          </p>
        </div>
        <button
          onClick={handleClearOthers}
          disabled={loading || sessions.length <= 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid var(--error)",
            background: "transparent",
            color: "var(--error)",
            fontWeight: 600,
            cursor: (loading || sessions.length <= 1) ? "not-allowed" : "pointer",
            opacity: (loading || sessions.length <= 1) ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          <LogOut size={16} />
          ล้างเซสชั่นอื่นทั้งหมด
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
            กำลังโหลดข้อมูลเซสชั่น...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)" }}>
            ไม่พบเซสชั่น
          </div>
        ) : (
          sessions.map((session, index) => {
            const isCurrent = index === 0;
            return (
              <div
                key={session.id}
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: isCurrent ? "2px solid var(--primary)" : "1px solid var(--border)",
                  boxShadow: "var(--card-shadow)",
                  padding: 24,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    background: "var(--live-bg)",
                    color: "var(--live-text)",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                      อุปกรณ์ปัจจุบัน
                  </div>
                )}
                
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  background: "var(--bg-page)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  flexShrink: 0
                }}>
                  {getDeviceIcon(session.userAgent)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, paddingRight: isCurrent ? 120 : 0 }}>
                    {session.name}
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", columnGap: 32, rowGap: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Globe size={16} className="text-muted" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>IP Address</div>
                        <div style={{ fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 500 }}>{session.ip}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Clock size={16} className="text-muted" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>เข้าใช้งานล่าสุด</div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{formatTime(session.lastActive)}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexBasis: "100%" }}>
                      <Info size={16} className="text-muted" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>เบราว์เซอร์</div>
                        <div style={{ color: "var(--text-primary)", fontSize: 13, lineHeight: 1.5 }}>{session.userAgent}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
