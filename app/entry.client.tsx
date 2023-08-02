import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next";

import i18n from "./i18n.ts";

async function hydrate() {
  await i18next
    .use(initReactI18next) // Tell i18next to use the react-i18next plugin
    // @ts-ignore
    .use(LanguageDetector) // Setup a client-side language detector
    .use(Backend) // Setup your backend
    .init({
      ...i18n, // spread the configuration
      backend: { loadPath: "/resources/locales/{{lng}}/{{ns}}" },
      detection: {
        // Here only enable htmlTag detection, we'll detect the language only
        // server-side with remix-i18next, by using the `<html lang>` attribute
        // on the browser, so we disable it
        caches: [],
        // Because we only use htmlTag, there's no reason to cache the language
        // we can communicate to the client the language detected server-side
        order: ["htmlTag"]
      },
      // This function detects the namespaces your routes rendered while SSR use
      ns: getInitialNamespaces()
    });

  startTransition(() => {
    hydrateRoot(
      document,
      //@ts-ignore
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
