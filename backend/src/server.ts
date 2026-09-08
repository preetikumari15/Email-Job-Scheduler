import "express-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { RedisStore } from "connect-redis";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { emailRouter } from "./routes/emails";
import { slackRouter } from "./routes/slack";
import { healthRouter } from "./routes/health";
import { requireAuth } from "./middleware/auth";
import { recoverPendingJobs } from "./services/recovery";
import { ensureIndex } from "./lib/search";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { emailQueue } from "./lib/queue";
const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(
  session({
    store: new RedisStore({ client: redis as any }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 3600 * 1000,
    },
  }),
);
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_a, _r, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"));
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          },
          create: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          },
        });
        done(null, user);
      } catch (e) {
        done(e as Error);
      }
    },
  ),
);
app.use(passport.initialize());
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/slack", requireAuth, slackRouter);
app.use("/api/emails", requireAuth, emailRouter);
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({ queues: [new BullMQAdapter(emailQueue)], serverAdapter });
app.use("/admin/queues", requireAuth, serverAdapter.getRouter());
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res
    .status(err?.status || 400)
    .json({ error: err?.message || "Unexpected error" });
});
app.listen(env.PORT, async () => {
  await ensureIndex();
  await recoverPendingJobs();
  console.log(`API listening on http://localhost:${env.PORT}`);
});
