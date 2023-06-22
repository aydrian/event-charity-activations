import { type DataFunctionArgs, Response, json } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "~/utils/emitter.server.ts";

interface ChangeFeedMessage<T> {
  length: number;
  payload: {
    after: T;
    key: string[];
    topic: string;
    updated: number;
  }[];
}

type AfterFields = {
  charity_id: string;
  event_id: string;
};

export const loader = async ({ request }: DataFunctionArgs) => {
  return eventStream(request.signal, function setup(send) {
    function handle(after: AfterFields) {
      send({
        data: JSON.stringify(after),
        event: "donation"
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

  const body = (await request.json()) as ChangeFeedMessage<AfterFields>;

  body.payload.forEach((payload) => {
    emitter.emit("new-message", payload.after);
  });

  return new Response("OK", { status: 200 });
};
