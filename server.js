import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import chalk from "chalk";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import * as fs from "node:fs";
import http from "node:http";
import https from "node:https";
import sourceMapSupport from "source-map-support";

import * as build from "./build/index.js";

sourceMapSupport.install();
installGlobals();

const BUILD_PATH = "./build/index.js";

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? await createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV
      })
);

const server =
  process.env.NODE_ENV === "development"
    ? https.createServer(
        {
          cert: fs.readFileSync("certs/cert.pem"),
          key: fs.readFileSync("certs/key.pem")
        },
        app
      )
    : http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    const localUrl = `https://localhost:${port}`;
    console.log(
      `
  ${chalk.bold("Local:")}   ${chalk.cyan(localUrl)}
${chalk.bold("Press Ctrl+C to stop")}
    `.trim()
    );

    broadcastDevReady(build);
  }
});

async function createDevRequestHandler() {
  // initial build
  /**
   * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
   */
  let devBuild = build;
  const chokidar = await import("chokidar");

  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on("all", async () => {
    // 1. purge require cache && load updated server build
    const stat = fs.statSync(BUILD_PATH);
    devBuild = import(BUILD_PATH + "?t=" + stat.mtimeMs);
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await devBuild);
  });

  return async (req, res, next) => {
    try {
      //
      return createRequestHandler({
        build: await devBuild,
        mode: "development"
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
