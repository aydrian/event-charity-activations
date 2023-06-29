import { type DataFunctionArgs, Response, json } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { getDashboardCharities } from "~/models/charity.server.ts";
import { emitter } from "~/utils/emitter.server.ts";

interface ChangeFeedMessage<T> {
  length: number;
  payload: T[];
}

type Payload = {
  charity_id: string;
  event_id: string;
  topic: string;
};

export type NewDonationEvent = {
  charities: Awaited<ReturnType<typeof getDashboardCharities>>;
  charityId: string;
};

export const loader = async ({ request }: DataFunctionArgs) => {
  return eventStream(request.signal, function setup(send) {
    function handle({ charity_id, event_id }: Payload) {
      getDashboardCharities(event_id).then((charities) => {
        send({
          data: JSON.stringify({ charities, charityId: charity_id }),
          event: `new-donation-${event_id}`
        });
      });
    }

    emitter.on("new-message", handle);

    return function clear() {
      emitter.off("new-message", handle);
    };
  });
};

export const action = async ({ request }: DataFunctionArgs) => {
  if (request.method !== "POST") {
    return json(
      { message: "Method not allowed" },
      { headers: { Allow: "POST" }, status: 405 }
    );
  }

  const body = (await request.json()) as ChangeFeedMessage<Payload>;

  body.payload.forEach((payload) => {
    emitter.emit("new-message", payload);
  });

  return new Response("OK", { status: 200 });
};
