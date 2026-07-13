import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendReviewRequestSms, sendReviewRequestEmail } from "@/lib/notify";

const createRequestSchema = z.object({
  businessId: z.string(),
  contactId: z.string(),
  channel: z.enum(["SMS", "EMAIL"]),
});

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId query param required" }, { status: 400 });
  }
  const requests = await db.reviewRequest.findMany({
    where: { businessId },
    include: { contact: true, response: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

// Creates a review request and immediately sends it. In production this
// would typically be queued (e.g. via a job runner) rather than sent inline.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { businessId, contactId, channel } = parsed.data;

  const [business, contact] = await Promise.all([
    db.business.findUnique({ where: { id: businessId } }),
    db.contact.findUnique({ where: { id: contactId } }),
  ]);
  if (!business || !contact) {
    return NextResponse.json({ error: "Business or contact not found" }, { status: 404 });
  }

  const request = await db.reviewRequest.create({
    data: { businessId, contactId, channel, status: "QUEUED" },
  });

  const link = `${process.env.APP_BASE_URL}/r/${request.id}`;

  try {
    if (channel === "SMS" && contact.phone) {
      await sendReviewRequestSms(contact.phone, business.name, link);
    } else if (channel === "EMAIL" && contact.email) {
      await sendReviewRequestEmail(contact.email, business.name, link);
    } else {
      throw new Error(`Contact is missing ${channel === "SMS" ? "a phone number" : "an email"}`);
    }
    const updated = await db.reviewRequest.update({
      where: { id: request.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    await db.reviewRequest.update({ where: { id: request.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 502 }
    );
  }
}
