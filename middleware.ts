import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "otp_auth";
const SESSION_COOKIE_NAME = "otp_session";

async function getExpectedToken(): Promise<string> {
  const password = process.env.OTP_LOGIN_PASSWORD || "";
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isAuthEnabled(): boolean {
  return Boolean(process.env.OTP_LOGIN_PASSWORD?.trim());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ถ้าไม่ได้ตั้งรหัสผ่านไว้ ให้ผ่านทุกอย่าง (โหมดไม่ล็อกอิน)
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  // ถ้ามีเซสชั่นอยู่แล้ว แล้วพยายามเข้า /login ให้เด้งกลับหน้าแรก
  if (pathname === "/login") {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // อนุญาต API สำหรับ auth เสมอ
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // ป้องกัน GET /api/otp ด้วย token (ใช้ดูข้อมูลจากเว็บ)
  if (pathname.startsWith("/api/otp") && request.method === "GET") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const expected = await getExpectedToken();
    if (token !== expected) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // อนุญาตไฟล์ระบบของ Next และ API อื่น ๆ
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // หน้าที่เหลือ (/, /settings/...) ให้เช็คจาก session cookie แทน
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    if (pathname !== "/login") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
