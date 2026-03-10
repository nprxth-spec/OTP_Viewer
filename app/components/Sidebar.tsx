"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Settings, LogOut, ShieldCheck, ChevronDown } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          borderRadius: 8,
          textDecoration: "none",
          color: isActive ? "var(--primary)" : "var(--text-secondary)",
          backgroundColor: isActive ? "var(--live-bg)" : "transparent",
          fontWeight: isActive ? 600 : 500,
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        <span style={{ fontSize: 14 }}>{label}</span>
      </Link>
    );
  };

  return (
    <div
      style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--card-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
        <div style={{ 
          background: "var(--primary)", 
          color: "#fff", 
          width: 32, 
          height: 32, 
          borderRadius: 8, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <ShieldCheck size={20} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          OTP Viewer
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <NavItem href="/" icon={MessageSquare} label="OTP ล่าสุด" />
        
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "transparent",
              color: pathname.startsWith("/settings") ? "var(--primary)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Settings size={18} strokeWidth={pathname.startsWith("/settings") ? 2.5 : 2} />
              <span style={{ fontSize: 14, fontWeight: pathname.startsWith("/settings") ? 600 : 500 }}>ตั้งค่า (Settings)</span>
            </div>
            <ChevronDown 
              size={16} 
              style={{ 
                transform: isSettingsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s ease-in-out",
                color: "var(--text-muted)"
              }} 
            />
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateRows: isSettingsOpen ? "1fr" : "0fr",
              transition: "grid-template-rows 0.2s ease-in-out",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <div style={{ 
                marginTop: 4,
                marginLeft: 23,
                paddingLeft: 16,
                borderLeft: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}>
                <Link
                  href="/settings/logs"
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: pathname === "/settings/logs" ? "var(--primary)" : "var(--text-secondary)",
                    backgroundColor: pathname === "/settings/logs" ? "var(--live-bg)" : "transparent",
                    fontWeight: pathname === "/settings/logs" ? 600 : 500,
                    fontSize: 14,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Log เข้าสู่ระบบ
                </Link>
                <Link
                  href="/settings/sessions"
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: pathname === "/settings/sessions" ? "var(--primary)" : "var(--text-secondary)",
                    backgroundColor: pathname === "/settings/sessions" ? "var(--live-bg)" : "transparent",
                    fontWeight: pathname === "/settings/sessions" ? 600 : 500,
                    fontSize: 14,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  เซสชั่น (Sessions)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="transition-all"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: "auto",
          padding: "12px 14px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-secondary)",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--error-bg)";
          e.currentTarget.style.color = "var(--error)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--input-bg)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <LogOut size={18} />
        <span>ออกจากระบบ</span>
      </button>
    </div>
  );
}
