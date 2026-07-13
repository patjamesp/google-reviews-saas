export const dynamic = "force-dynamic";
import { db } from "@/lib/db";

const statusColor: Record<string, string> = {
  QUEUED: "text-slate",
  SENT: "text-slate",
  DELIVERED: "text-slate",
  FAILED: "text-coral",
  RESPONDED: "text-sage",
};

export default async function RequestsPage() {
  const business = await db.business.findFirst();
  const requests = business
    ? await db.reviewRequest.findMany({
        where: { businessId: business.id },
        include: { contact: true, response: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Requests</h1>
      <p className="text-slate mb-8">Every review request sent and how it was routed.</p>

      <div className="rounded-card border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-ink/10">
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Channel</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Routed to</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate">
                  No requests sent yet. Send one via POST /api/review-requests.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3">{r.contact.name}</td>
                <td className="px-5 py-3 text-slate">{r.channel}</td>
                <td className={`px-5 py-3 font-medium ${statusColor[r.status]}`}>{r.status}</td>
                <td className="px-5 py-3">{r.response?.rating ?? "—"}</td>
                <td className="px-5 py-3">
                  {r.response ? (
                    <span className={r.response.routedTo === "GOOGLE" ? "text-sage" : "text-amber"}>
                      {r.response.routedTo === "GOOGLE" ? "Google" : "Private feedback"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
