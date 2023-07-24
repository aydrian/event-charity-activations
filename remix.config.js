import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  future: {
    v2_dev: {
      command: "node server.js",
      manual: true,
      scheme: "https",
      tlsCert: "certs/cert.pem",
      tlsKey: "certs/key.pem"
    },
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true
  },
  ignoredRouteFiles: ["**/.*"],
  postcss: true,
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
  serverModuleFormat: "esm",
  tailwind: true
};
