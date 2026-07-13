export const dynamic = "force-dynamic";import { db } from "@/lib/db";

// NOTE: hardcoded to the first business for scaffold purposes.
// Once auth is wired up, scope this to the logged-in business.
export default async function DashboardOverview() {
  const business = await db.business.findFirst();

  const [totalRequests, totalResponses, googleRouted] = business
    ? await Promise.all([
        db.reviewRequest.count({ where: { businessId: business.id } }),
        db.reviewResponse.count({ where: { request: { businessId: business.id } } }),
        db.reviewResponse.count({
          where: { request: { businessId: business.id }, routedTo: "GOOGLE" },
        }),
      ])
    : [0, 0, 0];

  const stats = [
    { label: "Requests sent", value: totalRequests },
    { label: "Responses", value: totalResponses },
    { label: "Routed to Google", value: googleRouted, accent: "text-sage" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Overview</h1>
      <p className="text-slate mb-8">
        {business ? business.name : "No business set up yet — create one via the API to get started."}
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card border border-ink/10 bg-white px-5 py-4">
            <div className={`font-display text-3xl ${stat.accent ?? "text-ink"}`}>{stat.value}</div>
            <div className="text-sm text-slate mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
