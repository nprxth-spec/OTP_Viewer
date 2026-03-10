import { randomUUID } from "crypto";

export type AuthLog = {
  id: string;
  time: string;
  action: "LOGIN" | "LOGOUT";
  ip: string;
  userAgent: string;
  success: boolean;
};

export type Session = {
  id: string;
  createdAt: string;
  lastActive: string;
  ip: string;
  userAgent: string;
  name: string;
};

class Store {
  authLogs: AuthLog[] = [];
  activeSessions = new Map<string, Session>();

  addLog(log: Omit<AuthLog, "id" | "time">) {
    this.authLogs.unshift({
      ...log,
      id: randomUUID(),
      time: new Date().toISOString(),
    });
    if (this.authLogs.length > 500) this.authLogs.pop();
  }

  createSession(ip: string, userAgent: string): Session {
    const session: Session = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      ip,
      userAgent,
      name: `Session ${this.activeSessions.size + 1}`,
    };
    this.activeSessions.set(session.id, session);
    return session;
  }

  getSession(id: string) {
    return this.activeSessions.get(id);
  }

  removeSession(id: string) {
    this.activeSessions.delete(id);
  }

  clearOtherSessions(currentId: string) {
    for (const id of this.activeSessions.keys()) {
      if (id !== currentId) {
        this.activeSessions.delete(id);
      }
    }
  }

  getAllSessions() {
    return Array.from(this.activeSessions.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }

  getAllLogs() {
    return [...this.authLogs];
  }
}

// Global store to persist across HMR in Next.js development
const globalAny = global as any;
if (!globalAny.otpStore) {
  globalAny.otpStore = new Store();
}
export const store: Store = globalAny.otpStore;
