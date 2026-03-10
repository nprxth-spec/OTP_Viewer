import { NextRequest, NextResponse } from "next/server";
import {
  getAuthCookieValue,
  getAuthCookieName,
  getAuthCookieOptions,
  isAuthEnabled,
} from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json(
      { message: "Login is not configured. Set OTP_LOGIN_PASSWORD in .env" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    const expected = getAuthCookieValue();
    const inputHash = await hashSha256(password);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    if (inputHash !== expected || !password.trim()) {
      store.addLog({ action: "LOGIN", ip, userAgent, success: false });
      return NextResponse.json(
        { message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    const session = store.createSession(ip, userAgent);
    store.addLog({ action: "LOGIN", ip, userAgent, success: true });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(getAuthCookieName(), expected, getAuthCookieOptions());
    res.cookies.set("otp_session", session.id, getAuthCookieOptions());
    return res;
  } catch {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 },
    );
  }
}

function hashSha256(text: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(text))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}
