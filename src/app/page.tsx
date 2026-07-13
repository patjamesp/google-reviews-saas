export default function MarketingHome() {
  return (
    <main className="min-h-screen">
      <section className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate mb-6">
          For local businesses
        </p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink mb-6">
          Every good visit should end up on Google.
        </h1>
        <p className="text-lg text-slate max-w-xl mb-10 leading-relaxed">
          Loopback texts your customers one question after every visit. Happy
          ones get routed straight to your Google review page. Unhappy ones
          get caught privately, before they go public.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-ink text-parchment font-body font-medium px-6 py-3 rounded-card hover:bg-ink/90 transition-colors"
        >
          Open dashboard →
        </a>
      </section>
    </main>
  );
}
