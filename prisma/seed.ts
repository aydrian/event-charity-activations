import { Prisma, PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.create({
    data: {
      email: "aydrian@cockroachlabs.com",
      firstName: "Aydrian",
      fullName: "Aydrian Howard",
      id: "8e346dd2-4e44-40f1-a19e-45ffe0be1e09",
      lastName: "Howard"
    }
  });

  await prisma.charity.createMany({
    data: [
      {
        createdBy: user.id,
        description: "Black Girls Code",
        id: "57671ca8-1772-4b05-af47-564577a8e8b5",
        logoSVG: await fs.promises.readFile(
          "./prisma/assets/black-girls-code.svg",
          {
            encoding: "utf-8"
          }
        ),
        name: "Black Girls Code",
        slug: "black-girls-code",
        twitter: "blackgirlscode",
        website: "https://wearebgc.org/"
      },
      {
        createdBy: user.id,
        description: "Women Who Code",
        id: "fa57f748-d67f-426a-ab22-a1aba01ea80d",
        logoSVG: await fs.promises.readFile(
          "./prisma/assets/women-who-code.svg",
          {
            encoding: "utf-8"
          }
        ),
        name: "Women Who Code",
        slug: "women-who-code",
        twitter: "womenwhocode",
        website: "https://www.cancerresearch.org/"
      },
      {
        createdBy: user.id,
        description: "UNICEF",
        id: "d88bf1e9-5039-4489-9e78-cde32ae238c9",
        logoSVG: await fs.promises.readFile("./prisma/assets/unicef.svg", {
          encoding: "utf-8"
        }),
        name: "UNICEF",
        slug: "unicef",
        twitter: "unicef",
        website: "https://www.unicef.org/"
      },
      {
        createdBy: user.id,
        description: "Cancer Research Institute",
        id: "73c41cc0-a6d3-43ae-8cda-2015e12345c8",
        logoSVG: await fs.promises.readFile(
          "./prisma/assets/cancer-research-institute.svg",
          { encoding: "utf-8" }
        ),
        name: "Cancer Research Institute",
        slug: "cancer-research-institute",
        twitter: "CancerResearch",
        website: "https://www.cancerresearch.org/"
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
        charityId: "57671ca8-1772-4b05-af47-564577a8e8b5",
        color: "#f433ff",
        eventId: event.id
      },
      {
        charityId: "73c41cc0-a6d3-43ae-8cda-2015e12345c8",
        color: "#ff5b00",
        eventId: event.id
      },
      {
        charityId: "d88bf1e9-5039-4489-9e78-cde32ae238c9",
        color: "#0165fc",
        eventId: event.id
      },
      {
        charityId: "fa57f748-d67f-426a-ab22-a1aba01ea80d",
        color: "#fff917",
        eventId: event.id
      }
    ]
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
