import GitHubLogo from "./github-logo";

export default function Footer() {
  return (
    <footer className="bg-black">
      <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
        <li>
          <a
            href="https://twitter.com/CockroachDB/"
            target="_blank"
            rel="noreferrer"
          >
            @CockroachDB
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
