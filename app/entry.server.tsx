import type { EntryContext } from "@remix-run/node";

import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import Backend from "i18next-prisma-backend";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { PassThrough } from "stream";

import i18n from "~/i18n.ts"; // your i18n configuration file

import i18next from "~/utils/i18next.server.ts";

import { prisma } from "./utils/db.server.ts";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  let instance = createInstance();
  let lng = await i18next.getLocale(request);
  let ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      backend: { client: prisma },
      lng, // The locale we detected above
      ns // The namespaces the routes about to render wants to use
    });

  return new Promise((resolve, reject) => {
    let didError = false;

    let { abort, pipe } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          let body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          );

          pipe(body);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
        onShellError(error: unknown) {
          reject(error);
        }
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
