import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { queueConnection } from "../lib/redis";
import { env } from "../config/env";
import { sendMail } from "../lib/mailer";
import { indexEmail } from "../lib/search";
import { notifySlack } from "../routes/slack";
function hourKey(senderId: string, d = new Date()) {
  const h = new Date(d);
  h.setMinutes(0, 0, 0);
  return `rate:${senderId}:${h.toISOString()}`;
}
async function claimRate(senderId: string, limit: number, at = new Date()) {
  const key = hourKey(senderId, at);
  const current = await (await import("../lib/redis")).redis.incr(key);
  if (current === 1) {
    const next = new Date(at);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    await (
      await import("../lib/redis")
    ).redis.expire(
      key,
      Math.max(60, Math.ceil((next.getTime() - Date.now()) / 1000) + 60),
    );
  }
  if (current <= limit) return { allowed: true };
  await (await import("../lib/redis")).redis.decr(key);
  return { allowed: false };
}
async function nextHour(d = new Date()) {
  const n = new Date(d);
  n.setHours(n.getHours() + 1, 0, 0, 0);
  return n;
}
async function process(job: Job) {
  const email = await prisma.email.findUnique({
    where: { id: job.data.emailId },
    include: { sender: true },
  });
  if (!email) return;
  if (email.status === "SENT") return;
  const now = new Date();
  if (email.scheduledAt.getTime() > now.getTime() + 500) {
    await job.moveToDelayed(email.scheduledAt.getTime(), job.token!);
    return;
  }
  const rate = await claimRate(email.senderId, email.sender.hourlyLimit, now);
  if (!rate.allowed) {
    const target = await nextHour(now);
    const shifted = Math.max(
      target.getTime(),
      email.scheduledAt.getTime() + env.MIN_SEND_DELAY_MS,
    );
    await prisma.email.update({
      where: { id: email.id },
      data: {
        scheduledAt: new Date(shifted),
        lastError: `Hourly limit reached; rescheduled for ${new Date(shifted).toISOString()}`,
      },
    });
    await notifySlack(
      email.userId,
      `ReachInbox rate limit reached for ${email.sender.email}. Email ${email.recipient} was delayed to ${new Date(shifted).toLocaleString()}.`,
    );
    await job.moveToDelayed(shifted, job.token!);
    return;
  }
  const locked = await prisma.email.updateMany({
    where: { id: email.id, status: { in: ["SCHEDULED", "PROCESSING"] } },
    data: { status: "PROCESSING", attempts: { increment: 1 } },
  });
  if (!locked.count) return;
  try {
    await sendMail({
      from: email.sender.email,
      to: email.recipient,
      subject: email.subject,
      body: email.body,
      messageId: email.messageId,
    });
    const done = await prisma.email.update({
      where: { id: email.id },
      data: { status: "SENT", sentAt: new Date(), lastError: null },
    });
    await indexEmail(done);
  } catch (e: any) {
    const failed = await prisma.email.update({
      where: { id: email.id },
      data: { status: "FAILED", lastError: String(e?.message || e) },
    });
    await indexEmail(failed);
    throw e;
  }
}
const worker = new Worker("email-scheduler", process, {
  connection: queueConnection,
  concurrency: env.WORKER_CONCURRENCY,
  limiter: {
    max: Math.max(1, Math.floor(3600000 / Math.max(1, env.MIN_SEND_DELAY_MS))),
    duration: 3600000,
  },
} as any);
worker.on("completed", (j) => console.log(`completed ${j.id}`));
worker.on("failed", (j, e) => console.error(`failed ${j?.id}`, e.message));
console.log(
  `Email worker running; concurrency=${env.WORKER_CONCURRENCY}, minDelay=${env.MIN_SEND_DELAY_MS}ms`,
);
