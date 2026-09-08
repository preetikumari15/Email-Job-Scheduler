import express from "express";
import cors from "cors";
import session from "express-session";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
    }
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "ReachInbox Scheduler API is running"
  });
});

export default app;