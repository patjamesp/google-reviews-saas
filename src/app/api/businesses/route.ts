import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createBusinessSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  googlePlaceId: z.string().optional(),
});

export async function GET() {
  const businesses = await db.business.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const business = await db.business.create({ data: parsed.data });
  return NextResponse.json(business, { status: 201 });
}
