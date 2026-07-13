import twilio from "twilio";
import postmark from "postmark";

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const postmarkClient = process.env.POSTMARK_SERVER_TOKEN
  ? new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN)
  : null;

export async function sendReviewRequestSms(to: string, businessName: string, link: string) {
  if (!twilioClient) throw new Error("Twilio is not configured");
  return twilioClient.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body: `${businessName}: How was your visit? Tap to let us know — ${link}`,
  });
}

export async function sendReviewRequestEmail(to: string, businessName: string, link: string) {
  if (!postmarkClient) throw new Error("Postmark is not configured");
  return postmarkClient.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL ?? "",
    To: to,
    Subject: `How was your experience with ${businessName}?`,
    HtmlBody: `<p>We'd love your feedback — it takes 10 seconds.</p><p><a href="${link}">Tap here to rate your visit</a></p>`,
    MessageStream: "outbound",
  });
}
