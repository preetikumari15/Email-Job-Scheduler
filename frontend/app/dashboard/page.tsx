"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  Plus,
  MessageSquare,
  RefreshCw,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { api } from "../../lib/api";
import type { Email, User } from "../../types";

const demoUser: User = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  avatar: null,
};

// Demo scheduled emails
const demoScheduledEmails: Email[] = [
  {
    id: "demo-scheduled-1",
    recipient: "john.doe@example.com",
    subject: "Welcome to ReachInbox",
    body: "Hi John, welcome to ReachInbox!",
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    sentAt: null,
    status: "SCHEDULED",
    attempts: 0,
    lastError: null,
  },
  {
    id: "demo-scheduled-2",
    recipient: "sarah.wilson@example.com",
    subject: "Product Demo Follow-up",
    body: "Hi Sarah, following up regarding our product demo.",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    status: "SCHEDULED",
    attempts: 0,
    lastError: null,
  },
  {
    id: "demo-scheduled-3",
    recipient: "alex.morgan@example.com",
    subject: "Partnership Opportunity",
    body: "Hi Alex, I would love to discuss a potential partnership.",
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    status: "SCHEDULED",
    attempts: 0,
    lastError: null,
  },
  {
    id: "demo-scheduled-4",
    recipient: "marketing@acme.com",
    subject: "Campaign Update",
    body: "Here is the latest update regarding our campaign.",
    scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    status: "SCHEDULED",
    attempts: 0,
    lastError: null,
  },
];

// Demo sent emails
const demoSentEmails: Email[] = [
  {
    id: "demo-sent-1",
    recipient: "emma@example.com",
    subject: "Thanks for your time",
    body: "Thank you for taking the time to speak with us.",
    scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "SENT",
    attempts: 1,
    lastError: null,
  },
  {
    id: "demo-sent-2",
    recipient: "david@example.com",
    subject: "Your application update",
    body: "We wanted to share an update regarding your application.",
    scheduledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "SENT",
    attempts: 1,
    lastError: null,
  },
  {
    id: "demo-sent-3",
    recipient: "lisa@example.com",
    subject: "Meeting confirmation",
    body: "This email confirms our upcoming meeting.",
    scheduledAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    status: "SENT",
    attempts: 1,
    lastError: null,
  },
  {
    id: "demo-sent-4",
    recipient: "contact@startup.io",
    subject: "Introduction — ReachInbox",
    body: "Hello, I wanted to introduce ReachInbox and our email scheduling platform.",
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    status: "SENT",
    attempts: 1,
    lastError: null,
  },
];

export default function Dashboard() {
  const [user] = useState<User>(demoUser);

  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");

  const [items, setItems] = useState<Email[]>([]);

  const [loading, setLoading] = useState(true);

  const [apiConnected, setApiConnected] = useState(false);

  // Load emails
  async function load() {
    setLoading(true);

    try {
      const data = await api<Email[]>(`/api/emails/${tab}`);

      if (data && data.length > 0) {
        setItems(data);
        setApiConnected(true);
      } else {
        setItems(tab === "scheduled" ? demoScheduledEmails : demoSentEmails);
        setApiConnected(true);
      }
    } catch (error) {
      console.log("Backend unavailable. Showing demo emails.", error);

      setItems(tab === "scheduled" ? demoScheduledEmails : demoSentEmails);

      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  // Statistics
  const scheduledCount =
    tab === "scheduled" ? items.length : demoScheduledEmails.length;

  const sentCount = tab === "sent" ? items.length : demoSentEmails.length;

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      {/* ================= HEADER ================= */}

      <header className="h-16 border-b border-[#202530] flex items-center justify-between px-5 md:px-10 bg-[#0b0d12]">
        {/* Logo */}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Mail size={19} className="text-indigo-400" />
          </div>

          <div>
            <b className="text-white">ReachInbox</b>

            <span className="text-gray-500 text-sm ml-2 hidden sm:inline">
              Email Scheduler
            </span>
          </div>
        </div>

        {/* User */}

        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User avatar"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
              D
            </div>
          )}

          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">{user.name}</div>

            <div className="text-gray-500 text-xs">{user.email}</div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="max-w-7xl mx-auto p-5 md:p-10">
        {/* Page heading */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Email campaigns</h1>

            <p className="text-gray-500 mt-2">
              Schedule, monitor and manage your outbound messages.
            </p>
          </div>

          {/* Actions */}

          <div className="flex flex-wrap gap-2">
            <a
              href="/compose"
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={17} />
              Compose New Email
            </a>

            <a
              href="http://localhost:4000/api/slack/connect"
              className="px-4 py-2.5 rounded-lg border border-[#30343f] hover:bg-[#151821] transition flex items-center gap-2 text-sm"
            >
              <MessageSquare size={17} />
              Connect Slack
            </a>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          {/* Scheduled */}

          <div className="rounded-xl border border-[#202530] bg-[#10131a] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Scheduled</p>

                <p className="text-2xl font-bold mt-2">{scheduledCount}</p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Clock3 size={20} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Sent */}

          <div className="rounded-xl border border-[#202530] bg-[#10131a] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sent</p>

                <p className="text-2xl font-bold mt-2">{sentCount}</p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-400" />
              </div>
            </div>
          </div>

          {/* Connection */}

          <div className="rounded-xl border border-[#202530] bg-[#10131a] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">System status</p>

                <p className="text-lg font-semibold mt-2">
                  {apiConnected ? "Demo Mode" : "Connected"}
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  apiConnected ? "bg-yellow-500/10" : "bg-green-500/10"
                }`}
              >
                {apiConnected ? (
                  <AlertCircle size={20} className="text-yellow-400" />
                ) : (
                  <CheckCircle2 size={20} className="text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setTab("scheduled")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "scheduled"
                ? "bg-indigo-600 text-white"
                : "border border-[#30343f] text-gray-400 hover:bg-[#151821]"
            }`}
          >
            <Mail size={16} />
            Scheduled
            <span className="text-xs opacity-70">{scheduledCount}</span>
          </button>

          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              tab === "sent"
                ? "bg-indigo-600 text-white"
                : "border border-[#30343f] text-gray-400 hover:bg-[#151821]"
            }`}
          >
            <Send size={16} />
            Sent
            <span className="text-xs opacity-70">{sentCount}</span>
          </button>

          {/* Refresh */}

          <button
            onClick={load}
            className="ml-auto w-10 h-10 rounded-lg border border-[#30343f] flex items-center justify-center hover:bg-[#151821] transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ================= EMAIL TABLE ================= */}

        <div className="rounded-xl border border-[#202530] bg-[#10131a] overflow-hidden">
          {loading ? (
            /* Loading */

            <div className="p-16 text-center">
              <RefreshCw
                size={25}
                className="mx-auto mb-4 animate-spin text-indigo-400"
              />

              <p className="text-gray-400">Loading emails...</p>
            </div>
          ) : items.length === 0 ? (
            /* Empty */

            <div className="p-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                <Mail size={25} className="text-indigo-400" />
              </div>

              <h3 className="font-semibold text-lg">No {tab} emails</h3>

              <p className="text-gray-500 mt-2 mb-5">
                Your {tab} messages will appear here.
              </p>

              {tab === "scheduled" && (
                <a
                  href="/compose"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium"
                >
                  <Plus size={17} />
                  Schedule your first email
                </a>
              )}
            </div>
          ) : (
            /* Table */

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0d1016]">
                  <tr className="border-b border-[#202530]">
                    <th className="p-4 text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Recipient
                    </th>

                    <th className="p-4 text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Subject
                    </th>

                    <th className="p-4 text-xs uppercase tracking-wide text-gray-500 font-medium">
                      {tab === "scheduled" ? "Scheduled time" : "Sent time"}
                    </th>

                    <th className="p-4 text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((email) => {
                    const date =
                      tab === "scheduled"
                        ? email.scheduledAt
                        : email.sentAt || email.scheduledAt;

                    return (
                      <tr
                        key={email.id}
                        className="border-t border-[#202530] hover:bg-[#141820] transition"
                      >
                        {/* Recipient */}

                        <td className="p-4">
                          <div className="font-medium text-sm whitespace-nowrap">
                            {email.recipient}
                          </div>
                        </td>

                        {/* Subject */}

                        <td className="p-4">
                          <div className="max-w-xs md:max-w-md truncate text-sm text-gray-300">
                            {email.subject}
                          </div>
                        </td>

                        {/* Date */}

                        <td className="p-4">
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {new Date(date).toLocaleString()}
                          </div>
                        </td>

                        {/* Status */}

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              email.status === "SENT"
                                ? "bg-green-500/10 text-green-400"
                                : email.status === "FAILED"
                                  ? "bg-red-500/10 text-red-400"
                                  : email.status === "PROCESSING"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : "bg-indigo-500/10 text-indigo-400"
                            }`}
                          >
                            {email.status === "SENT" && (
                              <CheckCircle2 size={12} />
                            )}

                            {email.status === "FAILED" && (
                              <AlertCircle size={12} />
                            )}

                            {email.status === "SCHEDULED" && (
                              <Clock3 size={12} />
                            )}

                            {email.status.toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
