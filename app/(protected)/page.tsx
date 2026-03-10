"use client";

import { useEffect, useState } from "react";
import { Smartphone, Clock, Copy, CopyCheck, MessageSquareText } from "lucide-react";

type OtpEntry = {
  otp: string;
  message?: string;
  time: string;
  deviceId: string;
  deviceName: string;
};

type ApiResponse = {
  items: OtpEntry[];
  latestByDevice: Record<string, OtpEntry>;
};

function CountdownTimer({ time }: { time: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(time).getTime() + 15 * 60 * 1000;
    function update() {
      setTimeLeft(Math.max(0, target - Date.now()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [time]);

  if (timeLeft <= 0) {
    return <span style={{ color: "var(--error)", fontWeight: 600 }}>หมดเวลา</span>;
  }

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const color = mins < 3 ? "var(--warning)" : "var(--success)";

  return (
    <span style={{ color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "none",
        backgroundColor: copied ? "var(--success-bg)" : "var(--input-bg)",
        color: copied ? "var(--success)" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      title="คัดลอก OTP"
    >
      {copied ? <CopyCheck size={18} /> : <Copy size={18} />}
    </button>
  );
};

export default function HomePage() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/otp", { cache: "no-store", credentials: "include" });
        if (!res.ok) return;
        const json: ApiResponse = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch OTP", error);
      }
    }

    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, []);

  const latestList = data?.latestByDevice ? Object.entries(data.latestByDevice) : [];
  const recentItems = data?.items ?? [];

  function formatTime(iso: string) {
    if (!iso || Number.isNaN(Date.parse(iso))) return "-";
    return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  return (
    <main style={{ padding: "32px 40px", minHeight: "100%" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: "0 0 8px 0" }}>
              ภาพรวม OTP
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              รหัส OTP ที่ถูกอ่านข้อความจากมือถือ Android ทั้งหมดจะถูกส่งมาแสดงที่นี่
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--primary)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              อัปเดตแบบ Real-time
            </span>
          </div>
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--section-title)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Smartphone size={16} /> ล่าสุดของแต่ละเครื่อง
          </h2>

          {latestList.length === 0 ? (
            <div style={{ padding: 40, borderRadius: 16, border: "1px dashed var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
              ยังไม่มี OTP เข้ามา — ส่ง SMS OTP มาที่มือถือที่ติดตั้งแอพ
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {latestList.map(([deviceId, entry]) => (
                <div key={deviceId} style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Smartphone size={16} color="var(--text-muted)" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{entry.deviceName}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{formatTime(entry.time)}</span>
                    </div>
                  </div>
                  
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>รหัส OTP</div>
                        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "0.15em", color: "var(--text-primary)", lineHeight: 1 }}>
                          {entry.otp}
                        </div>
                      </div>
                      <CopyButton text={entry.otp} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>หมดอายุใน:</span>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "var(--input-bg)" }}>
                        <CountdownTimer time={entry.time} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--section-title)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquareText size={16} /> ประวัติล่าสุด (ทั้งหมด)
          </h2>
          
          <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
            {recentItems.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                ไม่มีรายการประวัติ
              </div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead style={{ position: "sticky", top: 0, background: "var(--bg-page)", zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "12px 20px", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", width: "20%" }}>เครื่อง</th>
                      <th style={{ padding: "12px 20px", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", width: "15%" }}>OTP</th>
                      <th style={{ padding: "12px 20px", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", width: "45%" }}>ข้อความเต็ม</th>
                      <th style={{ padding: "12px 20px", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", width: "20%", textAlign: "right" }}>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentItems.map((item, i) => (
                      <tr key={`${item.deviceId}-${item.time}-${i}`} style={{ borderBottom: "1px solid var(--list-border)" }} className="transition-all hover:bg-[var(--input-bg)]">
                        <td style={{ padding: "16px 20px", fontWeight: 500, color: "var(--text-primary)" }}>{item.deviceName}</td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", color: "var(--primary)" }}>{item.otp}</span>
                        </td>
                        <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
                          {item.message || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>ไม่มีข้อความ</span>}
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {formatTime(item.time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
      <style dangerouslySetInlineStyle={{ __html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        tr:hover { background-color: var(--bg-page); }
      `}} />
    </main>
  );
}
