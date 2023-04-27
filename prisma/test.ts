import type { Charity } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const [{ id: charityId }] = await prisma.$queryRaw<
    Charity[]
  >`SELECT * FROM charities ORDER BY RANDOM() LIMIT 1`;

  await prisma.donation.create({
    data: {
      eventId: "78c444bb-0a2e-4f10-a3c9-0a180fad978b",
      charityId
    }
  });
}

test();
