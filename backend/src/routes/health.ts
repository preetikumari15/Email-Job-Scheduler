import { Router } from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
export const healthRouter = Router();
healthRouter.get("/", async (_, res) => {
  let db = "ok",
    r = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }
  try {
    await redis.ping();
  } catch {
    r = "down";
  }
  res.json({
    status: db === "ok" && r === "ok" ? "ok" : "degraded",
    database: db,
    redis: r,
  });
});
