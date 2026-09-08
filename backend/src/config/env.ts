import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  BACKEND_URL: z.string().default("http://localhost:4000"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  ELASTICSEARCH_URL: z.string().default("http://localhost:9200"),
  SESSION_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:4000/api/auth/google/callback"),
  ETHEREAL_HOST: z.string().default("smtp.ethereal.email"),
  ETHEREAL_PORT: z.coerce.number().default(587),
  ETHEREAL_USER: z.string().default(""),
  ETHEREAL_PASS: z.string().default(""),
  DEFAULT_SENDER_EMAIL: z.string().default(""),
  WORKER_CONCURRENCY: z.coerce.number().default(10),
  MIN_SEND_DELAY_MS: z.coerce.number().default(2000),
  DEFAULT_HOURLY_LIMIT: z.coerce.number().default(200),
  SLACK_CLIENT_ID: z.string().default(""),
  SLACK_CLIENT_SECRET: z.string().default(""),
  SLACK_REDIRECT_URI: z
    .string()
    .default("http://localhost:4000/api/slack/callback"),
  SLACK_SCOPES: z.string().default("chat:write"),
  ENCRYPTION_KEY: z
    .string()
    .length(32)
    .default("0123456789abcdef0123456789abcdef"),
});
export const env = schema.parse(process.env);
