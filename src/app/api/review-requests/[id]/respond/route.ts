import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { googleReviewLink } from "@/lib/google";

const respondSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedbackText: z.string().optional(),
});

// Core routing logic: 4-5 stars go to the business's public Google review
// page; 1-3 stars are captured privately so the business can follow up
// before it becomes a public review. Both paths are always offered to the
// customer — see the /r/[requestId] page — this endpoint just records the
// intended route based on the score.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { rating, feedbackText } = parsed.data;

  const request = await db.reviewRequest.findUnique({
    where: { id: params.id },
    include: { business: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Review request not found" }, { status: 404 });
  }

  const routedTo = rating >= 4 ? "GOOGLE" : "PRIVATE_FEEDBACK";

  const response = await db.reviewResponse.create({
    data: { requestId: request.id, rating, routedTo, feedbackText },
  });
  await db.reviewRequest.update({ where: { id: request.id }, data: { status: "RESPONDED" } });

  const googleUrl =
    routedTo === "GOOGLE" && request.business.googlePlaceId
      ? googleReviewLink(request.business.googlePlaceId)
      : null;

  return NextResponse.json({ response, googleUrl });
}
