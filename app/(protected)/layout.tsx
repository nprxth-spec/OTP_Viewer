import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { store } from "@/lib/store";
import { isAuthEnabled } from "@/lib/auth";
import Sidebar from "@/app/components/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isAuthEnabled()) {
    const sessionId = cookies().get("otp_session")?.value;
    if (!sessionId || !store.getSession(sessionId)) {
      redirect("/login");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page-gradient)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
