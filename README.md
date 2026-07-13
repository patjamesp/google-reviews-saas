# Loopback — Google review generation SaaS

Multi-tenant app that sends customers a one-tap rating request after a visit,
then routes them based on their score:

- **4-5 stars** → straight to the business's Google review page (deep link
  built from their Google Place ID)
- **1-3 stars** → a private feedback form, so the business hears about
  problems before they become a public review

Both paths are always available to the customer — see `NOTES.md` below on
why that matters for Google's policies.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + Postgres
- Twilio (SMS) / Postmark (email) for sending requests
- Tailwind for styling

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum to run locally
npm run db:push        # creates tables from prisma/schema.prisma
npx tsx prisma/seed.ts # optional: creates a demo business + contact
npm run dev
```

Visit `http://localhost:3000/dashboard` for the business-facing dashboard,
or `http://localhost:3000/r/<requestId>` for the customer-facing rating page
(grab a request ID from the `requests` table after sending one).

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/businesses` | GET/POST | List / create businesses |
| `/api/contacts` | GET/POST | List / create contacts (`?businessId=`) |
| `/api/review-requests` | GET/POST | List / send review requests (`?businessId=`) |
| `/api/review-requests/[id]/respond` | POST | Customer submits a rating (used by the `/r/[id]` page) |

## What's stubbed vs real

- **Auth**: not wired up yet. The dashboard currently reads the first
  `Business` row in the database. Plug in Clerk or Auth0 and scope every
  dashboard query + API route to `session.businessId`.
- **Sending**: Twilio/Postmark calls are real API calls — you just need
  credentials in `.env`. Sending currently happens inline in the API route;
  for production, move it to a queue (e.g. Inngest, BullMQ) so a slow
  provider response doesn't hold up the request.
- **Google Place ID lookup**: `src/lib/google.ts` has a working
  `resolvePlaceId()` using the Places API — call it once during business
  onboarding and store the result on `Business.googlePlaceId`.
- **Billing**: not included. Stripe Billing with a metered or per-seat plan
  tied to `Business.planTier` is the usual next step.

## Compliance note: review gating

Google's guidelines prohibit *review gating* — asking only customers you
expect to be happy to leave a review, while diverting unhappy customers away
from the platform entirely. This scaffold avoids that: every customer sees
the same first question, and the "route low scores to private feedback"
logic is a UX default, not a block — the thank-you screen for private
feedback still tells the customer they're welcome to leave a public review
if they want to.
