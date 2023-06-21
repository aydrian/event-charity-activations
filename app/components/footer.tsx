import appConfig from "~/app.config.ts";

import GitHubLogo from "./github-logo.tsx";

export default function Footer() {
  return (
    <footer className="bg-black">
      <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
        <li>
          <a
            href={`https://twitter.com/${appConfig.company.twitter}/`}
            rel="noreferrer"
            target="_blank"
          >
            @{appConfig.company.twitter}
          </a>
        </li>
        <li>
          <a
            href="https://github.com/aydrian/event-charity-activations/"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubLogo className="aspect-square h-7 text-white" />
          </a>
        </li>
      </ul>
    </footer>
  );
}
