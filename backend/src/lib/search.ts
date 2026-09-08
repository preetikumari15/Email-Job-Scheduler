import { Client } from "@elastic/elasticsearch";
import { env } from "../config/env";
export const es = new Client({ node: env.ELASTICSEARCH_URL });
export const EMAIL_INDEX = "reachinbox-emails";
export async function ensureIndex() {
  try {
    if (!(await es.indices.exists({ index: EMAIL_INDEX })).valueOf())
      await es.indices.create({ index: EMAIL_INDEX });
  } catch (e) {
    console.warn("Elasticsearch unavailable; search will be skipped.");
  }
}
export async function indexEmail(email: any) {
  try {
    await es.index({
      index: EMAIL_INDEX,
      id: email.id,
      document: {
        ...email,
        scheduledAt: new Date(email.scheduledAt).toISOString(),
        sentAt: email.sentAt ? new Date(email.sentAt).toISOString() : null,
      },
    });
  } catch (e) {
    console.warn("ES indexing failed");
  }
}
