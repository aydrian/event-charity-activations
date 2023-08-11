import appConfig from "~/app.config.ts";

import { Icon } from "./icon.tsx";

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
            <Icon className="aspect-square h-7 text-white" name="github" />
          </a>
        </li>
      </ul>
    </footer>
  );
}
