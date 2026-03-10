"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page-gradient)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "40px 32px",
          borderRadius: 24,
          background: "var(--card-bg)",
          boxShadow: "var(--card-shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: "var(--live-bg)", 
            color: "var(--primary)", 
            borderRadius: 16, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: 16
          }}>
            <Shield size={32} strokeWidth={2} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 8,
              letterSpacing: "-0.02em"
            }}
          >
            เข้าสู่ระบบ OTP Viewer
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              textAlign: "center",
              margin: 0
            }}
          >
            กรุณากรอกรหัสผ่านเพื่อเข้าถึงข้อมูล OTP
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              รหัสผ่าน
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                <KeyRound size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="ป้อนรหัสผ่านของคุณ"
                disabled={loading}
                className="focus-ring transition-all"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  fontSize: 15,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--error)",
                  marginTop: 8,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="transition-all"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: 14,
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: "var(--primary)",
              border: "none",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: 8
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                กำลังตรวจสอบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>
      </div>
      <style dangerouslySetInlineStyle={{ __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </main>
  );
}
