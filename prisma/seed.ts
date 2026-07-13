import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const business = await db.business.upsert({
    where: { slug: "demo-cafe" },
    update: {},
    create: {
      name: "Demo Cafe",
      slug: "demo-cafe",
      // Replace with a real Place ID — look it up via the Google Place ID
      // Finder tool: https://developers.google.com/maps/documentation/places/web-service/place-id
      googlePlaceId: "REPLACE_WITH_REAL_PLACE_ID",
      planTier: "TRIAL",
    },
  });

  const contact = await db.contact.create({
    data: {
      businessId: business.id,
      name: "Jamie Rivera",
      phone: "+15555550123",
      email: "jamie@example.com",
      source: "manual",
    },
  });

  console.log({ business, contact });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());
