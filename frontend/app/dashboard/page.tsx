"use client";
import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  Plus,
  LogOut,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import type { Email, User } from "../../types";
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");
  const [items, setItems] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      setUser(await api<User>("/api/auth/me"));
      setItems(await api<Email[]>(`/api/emails/${tab}`));
    } catch {
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [tab]);
  return (
    <div className="min-h-screen">
      <header className="h-16 border-b border-[#202530] flex items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Mail size={19} />
          </div>
          <b>ReachInbox</b>
          <span className="muted text-sm hidden sm:inline">
            Email Scheduler
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.name || "User avatar"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="hidden sm:block text-right">
            <div className="text-sm">{user?.name}</div>
            <div className="muted text-xs">{user?.email}</div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              await api("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-5 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-bold">Email campaigns</h1>
            <p className="muted mt-1">
              Schedule, monitor and search outbound messages.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/slack/connect"
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <MessageSquare size={17} /> Connect Slack
            </a>
            <a
              href="/compose"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={17} /> Compose New Email
            </a>
          </div>
        </div>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("scheduled")}
            className={`btn ${tab === "scheduled" ? "btn-primary" : "btn-secondary"}`}
          >
            <Mail size={16} className="inline mr-2" />
            Scheduled
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`btn ${tab === "sent" ? "btn-primary" : "btn-secondary"}`}
          >
            <Send size={16} className="inline mr-2" />
            Sent
          </button>
          <button onClick={load} className="btn btn-secondary ml-auto">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-10 text-center muted">Loading emails…</div>
          ) : items.length === 0 ? (
            <div className="p-14 text-center">
              <Mail className="mx-auto mb-3 muted" />
              <h3 className="font-semibold">No {tab} emails</h3>
              <p className="muted mt-1">
                Your {tab} messages will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-sm muted">
                  <tr>
                    <th className="p-4">Email</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">
                      {tab === "scheduled" ? "Scheduled time" : "Sent time"}
                    </th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.id} className="table-row">
                      <td className="p-4">{e.recipient}</td>
                      <td className="p-4 max-w-md truncate">{e.subject}</td>
                      <td className="p-4">
                        {new Date(
                          tab === "scheduled"
                            ? e.scheduledAt
                            : e.sentAt || e.scheduledAt,
                        ).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="pill">{e.status.toLowerCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
