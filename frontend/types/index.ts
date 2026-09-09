export type Email = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string;
  status: string;
  lastError?: string;
  sender: { email: string };
};
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  slackConnection?: { id: string; teamName?: string };
};
