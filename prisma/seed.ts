import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.create({
    data: {
      email: "aydrian@cockroachlabs.com",
      firstName: "Aydrian",
      fullName: "Aydrian Howard",
      id: "8e346dd2-4e44-40f1-a19e-45ffe0be1e09",
      lastName: "Howard",
      passwordHash: await bcrypt.hash("password1234", 10)
    }
  });

  await prisma.charity.createMany({
    data: [
      {
        createdBy: user.id,
        description: "Black Girls Code",
        id: "ed618393-b6c5-4b22-bec3-15b0a3ae3835",
        name: "Black Girls Code",
        slug: "black-girls-code"
      },
      {
        createdBy: user.id,
        description: "Women Who Code",
        id: "b1d05327-fe06-4318-a3e7-8a83fc7c19c2",
        name: "Women Who Code",
        slug: "women-who-code"
      },
      {
        createdBy: user.id,
        description: "UNICEF",
        id: "a91ef3a7-632b-4926-a8dd-817c6aea2f29",
        name: "UNICEF",
        slug: "unicef"
      },
      {
        createdBy: user.id,
        description: "Cancer Research Institute",
        id: "c5e1ea03-7c92-4939-b9cf-f874a6b64ff8",
        name: "Cancer Research Institute",
        slug: "cancer-research-institute"
      }
    ]
  });

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const event = await prisma.event.create({
    data: {
      createdBy: user.id,
      donationAmount: new Prisma.Decimal(3.0),
      endDate: nextWeek,
      id: "a291869e-b9a5-49c3-8fa3-62b92619835a",
      location: "Test Location",
      name: "Test Event",
      slug: "test-event",
      startDate: today
    }
  });

  await prisma.charitiesForEvents.createMany({
    data: [
      {
        charityId: "ed618393-b6c5-4b22-bec3-15b0a3ae3835",
        color: "#f433ff",
        eventId: event.id
      },
      {
        charityId: "b1d05327-fe06-4318-a3e7-8a83fc7c19c2",
        color: "#ff5b00",
        eventId: event.id
      },
      {
        charityId: "a91ef3a7-632b-4926-a8dd-817c6aea2f29",
        color: "#0165fc",
        eventId: event.id
      },
      {
        charityId: "c5e1ea03-7c92-4939-b9cf-f874a6b64ff8",
        color: "#fff917",
        eventId: event.id
      }
    ]
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
