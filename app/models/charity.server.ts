import { Prisma } from "@prisma/client";

const charityItem = Prisma.validator<Prisma.CharityArgs>()({
  select: { id: true, name: true }
});
export type CharityItem = Prisma.CharityGetPayload<typeof charityItem>;
