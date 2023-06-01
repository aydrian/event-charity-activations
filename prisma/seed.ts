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
      passwordHash,
      firstName,
      lastName,
      fullName
    }
  });

  await prisma.charity.createMany({
    data: [
      {
        name: "Black Girls Code",
        slug: "black-girls-code",
        description: "Black Girls Code",
        createdBy: user.id
      },
      {
        name: "Women Who Code",
        slug: "women-who-code",
        description: "Women Who Code",
        createdBy: user.id
      },
      {
        name: "UNICEF",
        slug: "unicef",
        description: "UNICEF",
        createdBy: user.id
      },
      {
        name: "Cancer Research Institute",
        slug: "cancer-research-institute",
        description: "Cancer Research Institute",
        createdBy: user.id
      }
    ]
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
