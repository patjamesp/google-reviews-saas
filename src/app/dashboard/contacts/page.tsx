export const dynamic = "force-dynamic";
import { db } from "@/lib/db";

export default async function ContactsPage() {
  const business = await db.business.findFirst();
  const contacts = business
    ? await db.contact.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Contacts</h1>
      <p className="text-slate mb-8">People you can send review requests to.</p>

      <div className="rounded-card border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-ink/10">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate">
                  No contacts yet. Add one via POST /api/contacts.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate">{c.phone ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate">{c.email ?? "—"}</td>
                <td className="px-5 py-3 text-slate">{c.source ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
