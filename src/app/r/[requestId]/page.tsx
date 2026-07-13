import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import RatingFlow from "./RatingFlow";

export default async function ReviewPage({ params }: { params: { requestId: string } }) {
  const request = await db.reviewRequest.findUnique({
    where: { id: params.requestId },
    include: { business: true, response: true },
  });

  if (!request) notFound();

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <RatingFlow
          requestId={request.id}
          businessName={request.business.name}
          alreadyResponded={!!request.response}
        />
      </div>
    </main>
  );
}
