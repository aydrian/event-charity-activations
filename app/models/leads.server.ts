import { prisma } from "~/utils/db.server.ts";

export async function getLeads(eventId: string) {
  return prisma.lead.findMany({
    orderBy: {
      lastName: "asc"
    },
    select: {
      company: true,
      email: true,
      firstName: true,
      id: true,
      jobRole: true,
      lastName: true,
      notes: true,
      score: true
    },
    where: {
      Donation: {
        eventId
      }
    }
  });
}
