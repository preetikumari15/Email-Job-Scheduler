import nodemailer from "nodemailer";
import { env } from "../config/env";
export const transporter = nodemailer.createTransport({
  host: env.ETHEREAL_HOST,
  port: env.ETHEREAL_PORT,
  secure: env.ETHEREAL_PORT === 465,
  auth: env.ETHEREAL_USER
    ? { user: env.ETHEREAL_USER, pass: env.ETHEREAL_PASS }
    : undefined,
});
export async function sendMail(input: {
  from: string;
  to: string;
  subject: string;
  body: string;
  messageId: string;
}) {
  return transporter.sendMail({
    from: input.from,
    to: input.to,
    subject: input.subject,
    text: input.body,
    html: `<div style="white-space:pre-wrap">${escapeHtml(input.body)}</div>`,
    messageId: `<${input.messageId}@reachinbox.local>`,
  });
}
function escapeHtml(s: string) {
  return s.replace(
    /[&<>\"]/g,
    (c) =>
      (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" }) as any)[c],
  );
}
