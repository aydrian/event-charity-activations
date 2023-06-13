import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const firstName = "DevRel";
  const lastName = "CockroachLabs";
  const fullName = "DevRel CockroachLabs";
  const email = "devrel@cockroachlabs.com";
  const passwordHash = await bcrypt.hash("password1234", 10);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      fullName,
      lastName,
      passwordHash
    }
  });

  await prisma.charity.createMany({
    data: [
      {
        createdBy: user.id,
        description: "Black Girls Code",
        name: "Black Girls Code",
        slug: "black-girls-code"
      },
      {
        createdBy: user.id,
        description: "Women Who Code",
        name: "Women Who Code",
        slug: "women-who-code"
      },
      {
        createdBy: user.id,
        description: "UNICEF",
        name: "UNICEF",
        slug: "unicef"
      },
      {
        createdBy: user.id,
        description: "Cancer Research Institute",
        name: "Cancer Research Institute",
        slug: "cancer-research-institute"
      }
    ]
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
