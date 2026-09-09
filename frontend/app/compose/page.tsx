"use client";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Upload, CalendarClock } from "lucide-react";
import { api } from "../../lib/api";
function parseRecipients(text: string) {
  return [
    ...new Set(
      text
        .split(/[\s,;]+/)
        .map((x) => x.trim())
        .filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)),
    ),
  ];
}
export default function Compose() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [start, setStart] = useState("");
  const [delay, setDelay] = useState("2000");
  const [limit, setLimit] = useState("200");
  const [sender, setSender] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(f: File) {
    const text = await f.text();
    setRecipients((r) => [r, ...parseRecipients(text)].join("\n"));
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const list = parseRecipients(recipients);
    if (!list.length) return setMsg("Add at least one valid recipient.");
    setBusy(true);
    try {
      const result = await api<{ count: number }>("/api/emails/schedule", {
        method: "POST",
        body: JSON.stringify({
          senderEmail: sender || undefined,
          recipients: list,
          subject,
          body,
          startTime: new Date(start).toISOString(),
          delayMs: Number(delay),
          hourlyLimit: Number(limit),
        }),
      });
      setMsg(`Scheduled ${result.count} emails successfully.`);
      setTimeout(() => (location.href = "/dashboard"), 800);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed to schedule emails.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen max-w-4xl mx-auto p-5 md:p-10">
      <a href="/dashboard" className="muted inline-flex gap-2 items-center">
        <ArrowLeft size={16} />
        Back to dashboard
      </a>
      <div className="mt-7 mb-6">
        <h1 className="text-3xl font-bold">Compose new email</h1>
        <p className="muted mt-1">
          Upload recipients and configure delivery pacing.
        </p>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm mb-2">Sender email</label>
          <input
            className="field"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="sender@ethereal.email"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">
            Recipients{" "}
            <span className="muted">
              ({parseRecipients(recipients).length} detected)
            </span>
          </label>
          <textarea
            className="field min-h-32"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="one email per line, or upload CSV/TXT"
          />
          <label className="btn btn-secondary inline-flex items-center gap-2 mt-2 cursor-pointer">
            <Upload size={16} /> Upload CSV/TXT
            <input
              hidden
              type="file"
              accept=".csv,.txt"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        </div>
        <div>
          <label className="block text-sm mb-2">Subject</label>
          <input
            required
            className="field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Body</label>
          <textarea
            required
            className="field min-h-40"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Start time</label>
            <input
              required
              type="datetime-local"
              className="field"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-2">
              Delay between emails (ms)
            </label>
            <input
              type="number"
              min="0"
              className="field"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Hourly limit</label>
            <input
              type="number"
              min="1"
              className="field"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </div>
        {msg && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            {msg}
          </div>
        )}
        <button
          disabled={busy}
          className="btn btn-primary w-full inline-flex justify-center items-center gap-2"
        >
          <CalendarClock size={17} />
          {busy ? "Scheduling…" : "Schedule emails"}
        </button>
      </form>
    </main>
  );
}
