import { prisma } from "~/utils/db.server";

export async function getLeads(eventId: string) {
  return prisma.lead.findMany({
    where: {
      Donation: {
        eventId
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      jobRole: true,
      score: true,
      notes: true
    },
    orderBy: {
      lastName: "asc"
    }
  });
}
