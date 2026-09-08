import crypto from "crypto";
import { env } from "../config/env";
const key = Buffer.from(env.ENCRYPTION_KEY, "utf8");
export function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([c.update(value, "utf8"), c.final()]);
  return `${iv.toString("hex")}:${c.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`;
}
export function decrypt(value: string) {
  const [ivHex, tagHex, dataHex] = value.split(":");
  const d = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  d.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    d.update(Buffer.from(dataHex, "hex")),
    d.final(),
  ]).toString("utf8");
}
