import GitHubLogo from "./github-logo";
import appConfig from "~/app.config";

export default function Footer() {
  return (
    <footer className="bg-black">
      <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
        <li>
          <a
            href={`https://twitter.com/${appConfig.company.twitter}/`}
            target="_blank"
            rel="noreferrer"
          >
            @{appConfig.company.twitter}
          </a>
        </li>
        <li>
          <a
            href="https://github.com/aydrian/event-charity-activations/"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubLogo className="aspect-square h-7 text-white" />
          </a>
        </li>
      </ul>
    </footer>
  );
}
