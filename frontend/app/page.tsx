"use client";
import { useEffect, useState } from "react";
import { Mail, ArrowRight, ShieldCheck, Clock3, Activity } from "lucide-react";
import { API, api } from "../lib/api";
export default function Home() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    api("/api/auth/me")
      .then(setUser)
      .catch(() => {});
  }, []);
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="pill inline-flex items-center gap-2">
            <Activity size={14} /> Production-style scheduler
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">
            Reliable email scheduling, without cron.
          </h1>
          <p className="muted text-lg mt-5 max-w-xl">
            Schedule hundreds of emails with BullMQ, Redis-backed rate limiting,
            restart recovery and a clean operational dashboard.
          </p>
          <div className="flex gap-3 mt-7">
            <a
              className="btn btn-primary inline-flex items-center gap-2"
              href={user ? "/dashboard" : `${API}/api/auth/google`}
            >
              {user ? "Open dashboard" : "Continue with Google"}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Mail />
            </div>
            <div>
              <div className="font-semibold">ReachInbox Scheduler</div>
              <div className="muted text-sm">
                Queue health · scheduling · delivery
              </div>
            </div>
          </div>
          {[
            ["Persistent queue", "BullMQ + Redis"],
            ["Distributed rate limits", "Redis counters"],
            ["Delivery testing", "Ethereal SMTP"],
            ["Search", "Elasticsearch"],
          ].map(([a, b]) => (
            <div key={a} className="flex justify-between py-4 table-row-border">
              <span>{a}</span>
              <span className="muted">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
