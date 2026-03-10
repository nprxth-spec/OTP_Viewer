import { createHash } from "crypto";

const COOKIE_NAME = "otp_auth";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export function getAuthCookieValue(): string {
  const password = process.env.OTP_LOGIN_PASSWORD || "";
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.OTP_LOGIN_PASSWORD?.trim());
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}
