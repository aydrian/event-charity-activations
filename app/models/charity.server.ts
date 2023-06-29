import { Prisma } from "@prisma/client";

import { prisma } from "~/utils/db.server.ts";

const charityItem = Prisma.validator<Prisma.CharityArgs>()({
  select: { id: true, name: true }
});
export type CharityItem = Prisma.CharityGetPayload<typeof charityItem>;

export const getDashboardCharities = async (eventId: string) => {
  const [Charities, groupedResults] = await Promise.all([
    prisma.charitiesForEvents.findMany({
      select: {
        Charity: { select: { logoSVG: true, name: true } },
        charityId: true,
        color: true
      },
      where: { eventId }
    }),
    prisma.donation.groupBy({
      _count: {
        _all: true
      },
      by: ["charityId", "eventId"],
      where: { eventId }
    })
  ]);

  const counts: { [key: string]: number } = groupedResults.reduce(
    (obj, item) => {
      return { ...obj, [item.charityId]: item._count._all };
    },
    {}
  );
  const charities = Charities.map((charity) => {
    return {
      charity_id: charity.charityId,
      color: charity.color,
      count: counts[charity.charityId] || 0,
      logoSVG: charity.Charity.logoSVG,
      name: charity.Charity.name
    };
  });
  return charities;
};

/*
WITH
  grouped_donations AS (
    SELECT
        d.charity_id,
        d.event_id,
        count(*)
    FROM charity_activations.public.donations d
    GROUP BY d.charity_id, d.event_id
  )
SELECT
  gd.*,
  c.name,
  ce.color
FROM grouped_donations gd
JOIN charities c ON gd.charity_id = c.id
JOIN charities_events ce ON gd.charity_id = ce.charity_id AND gd.event_id = ce.event_id;
*/
