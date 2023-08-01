import Backend from "i18next-prisma-backend";
import { RemixI18Next } from "remix-i18next";

import i18n from "~/i18n.ts"; // your i18n configuration file

import { prisma } from "~/utils/db.server.ts";

let i18next = new RemixI18Next({
  detection: {
    fallbackLanguage: i18n.fallbackLng,
    supportedLanguages: i18n.supportedLngs
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18n,
    backend: {
      client: prisma
    }
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend]
});

export default i18next;
