import { Router } from "express";
import passport from "passport";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
export const authRouter = Router();
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${env.FRONTEND_URL}/login?error=oauth`,
  }),
  async (req, res) => {
    const u = req.user as any;
    (req.session as any).userId = u.id;
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  },
);
authRouter.get("/me", async (req, res) => {
  const id = (req.session as any).userId;
  if (!id) return res.status(401).json({ error: "Unauthenticated" });
  const user = await prisma.user.findUnique({
    where: { id },
    include: { slackConnection: { select: { id: true, teamName: true } } },
  });
  if (!user) return res.status(401).json({ error: "Unauthenticated" });
  res.json(user);
});
authRouter.post("/logout", (req, res) =>
  req.session.destroy(() => res.json({ ok: true })),
);
