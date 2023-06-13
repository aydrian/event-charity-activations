import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const eventId = "cef5b230-d6a4-4555-b595-a5e916b5812d"; // Camp Roach
  //const eventId = "78c444bb-0a2e-4f10-a3c9-0a180fad978b" // Test Event
  //[{ charityId }]
  const [{ charity_id: charityId }] = await prisma.$queryRaw<
    { charity_id: string }[]
  >`SELECT charity_id FROM charities_events WHERE event_id = ${eventId} ORDER BY RANDOM() LIMIT 1;`;
  console.log({ charityId, eventId });

  await prisma.donation.create({
    data: {
      charityId,
      eventId
    }
  });
}

test();
