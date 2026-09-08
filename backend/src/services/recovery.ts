import { prisma } from "../lib/prisma";
import { emailQueue } from "../lib/queue";
export async function recoverPendingJobs() {
  const pending = await prisma.email.findMany({
    where: { status: "SCHEDULED" },
  });
  for (const email of pending) {
    const job = await emailQueue.getJob(email.id);
    if (!job) {
      await emailQueue.add(
        "send-email",
        { emailId: email.id },
        {
          jobId: email.id,
          delay: Math.max(0, email.scheduledAt.getTime() - Date.now()),
        },
      );
    }
  }
}
