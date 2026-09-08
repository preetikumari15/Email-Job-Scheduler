import { Router } from "express";
import crypto from "crypto";
import { WebClient } from "@slack/web-api";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { encrypt } from "../lib/crypto";
export const slackRouter = Router();
slackRouter.get("/connect", async (req, res) => {
  if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET)
    return res.status(503).json({ error: "Slack OAuth is not configured" });
  const state = crypto.randomBytes(16).toString("hex");
  (req.session as any).slackState = state;
  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    scope: env.SLACK_SCOPES,
    redirect_uri: env.SLACK_REDIRECT_URI,
    state,
  });
  res.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
});
slackRouter.get("/callback", async (req, res) => {
  const { code, state } = req.query as any;
  if (!code || state !== (req.session as any).slackState)
    return res.status(400).send("Invalid Slack OAuth state");
  try {
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: env.SLACK_REDIRECT_URI,
      }),
    });
    const data: any = await response.json();
    if (!data.ok) throw new Error(data.error);
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).send("Login required");
    await prisma.slackConnection.upsert({
      where: { userId },
      update: {
        teamId: data.team?.id,
        teamName: data.team?.name,
        accessToken: encrypt(data.access_token),
      },
      create: {
        userId,
        teamId: data.team?.id,
        teamName: data.team?.name,
        accessToken: encrypt(data.access_token),
      },
    });
    delete (req.session as any).slackState;
    res.redirect(`${env.FRONTEND_URL}/dashboard?slack=connected`);
  } catch (e) {
    res.status(500).send("Slack connection failed");
  }
});
slackRouter.delete("/disconnect", async (req, res) => {
  const userId = (req.session as any).userId;
  if (userId) await prisma.slackConnection.deleteMany({ where: { userId } });
  res.json({ ok: true });
});
export async function notifySlack(userId: string, text: string) {
  const connection = await prisma.slackConnection.findUnique({
    where: { userId },
  });
  if (!connection) return;
  try {
    const { decrypt } = await import("../lib/crypto");
    const client = new WebClient(decrypt(connection.accessToken));
    await client.chat.postMessage({ channel: "me", text });
  } catch (e) {
    console.warn("Slack notification skipped/failed");
  }
}
