import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getAllSessions());
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get("otp_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  store.clearOtherSessions(sessionId);
  return NextResponse.json({ ok: true });
}
