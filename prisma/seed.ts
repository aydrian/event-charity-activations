import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const fullName = "CockroachLabs DevRel";
  const email = "devrel@cockroachlabs.com";
  const passwordHash = await bcrypt.hash("password1234", 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
