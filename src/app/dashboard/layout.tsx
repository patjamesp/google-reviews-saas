import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/requests", label: "Requests" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-ink/10 px-5 py-8 flex flex-col gap-1">
        <div className="font-display text-xl text-ink mb-8 px-1">Loopback</div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-card text-sm font-medium text-slate hover:bg-ink/5 hover:text-ink transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 px-10 py-8">{children}</div>
    </div>
  );
}
