import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { emailQueue } from "../lib/queue";
import { env } from "../config/env";
import { indexEmail } from "../lib/search";
export const emailRouter = Router();
const scheduleSchema = z.object({
  senderEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  startTime: z.coerce.date(),
  delayMs: z.number().int().min(0).max(3600000).default(env.MIN_SEND_DELAY_MS),
  hourlyLimit: z
    .number()
    .int()
    .min(1)
    .max(100000)
    .default(env.DEFAULT_HOURLY_LIMIT),
});
emailRouter.post("/schedule", async (req, res, next) => {
  try {
    const input = scheduleSchema.parse(req.body);
    const user = (req as any).user;
    const senderEmail =
      input.senderEmail || env.DEFAULT_SENDER_EMAIL || user.email;
    const sender = await prisma.sender.upsert({
      where: { userId_email: { userId: user.id, email: senderEmail } },
      update: { displayName: input.senderName, hourlyLimit: input.hourlyLimit },
      create: {
        userId: user.id,
        email: senderEmail,
        displayName: input.senderName,
        hourlyLimit: input.hourlyLimit,
      },
    });
    const emails = [] as any[];
    for (let i = 0; i < input.recipients.length; i++) {
      const original = new Date(input.startTime.getTime() + i * input.delayMs);
      const messageId = crypto.randomUUID();
      const email = await prisma.email.create({
        data: {
          userId: user.id,
          senderId: sender.id,
          recipient: input.recipients[i],
          subject: input.subject,
          body: input.body,
          scheduledAt: original,
          originalAt: original,
          messageId,
        },
      });
      const job = await emailQueue.add(
        "send-email",
        { emailId: email.id },
        {
          jobId: email.id,
          delay: Math.max(0, original.getTime() - Date.now()),
        },
      );
      const updated = await prisma.email.update({
        where: { id: email.id },
        data: { bullJobId: job.id },
      });
      emails.push(updated);
      await indexEmail(updated);
    }
    res.status(201).json({ count: emails.length, emails });
  } catch (e) {
    next(e);
  }
});
emailRouter.get("/scheduled", async (req, res) => {
  const user = (req as any).user;
  const items = await prisma.email.findMany({
    where: { userId: user.id, status: "SCHEDULED" },
    orderBy: { scheduledAt: "asc" },
    include: { sender: { select: { email: true } } },
    take: 1000,
  });
  res.json(items);
});
emailRouter.get("/sent", async (req, res) => {
  const user = (req as any).user;
  const items = await prisma.email.findMany({
    where: { userId: user.id, status: { in: ["SENT", "FAILED"] } },
    orderBy: { sentAt: "desc" },
    include: { sender: { select: { email: true } } },
    take: 1000,
  });
  res.json(items);
});
emailRouter.get("/search", async (req, res) => {
  const user = (req as any).user;
  const q = String(req.query.q || "").trim();
  if (!q) return res.json([]);
  try {
    const { es, EMAIL_INDEX } = await import("../lib/search");
    const result = await es.search({
      index: EMAIL_INDEX,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: q,
                fields: ["recipient", "subject", "body"],
              },
            },
            { term: { userId: user.id } },
          ],
        },
      },
      size: 50,
    });
    return res.json(result.hits.hits.map((h: any) => h._source));
  } catch {
    return res.json([]);
  }
});
