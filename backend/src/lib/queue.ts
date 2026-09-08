import { Queue } from "bullmq";
import { queueConnection } from "./redis";
export const EMAIL_QUEUE = "email-scheduler";
export const emailQueue = new Queue(EMAIL_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  },
});
