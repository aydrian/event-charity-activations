import { Icon } from "~/components/icon.tsx";
import { Button } from "~/components/ui/button.tsx";
import { cn } from "~/utils/misc.ts";

export default function TweetButton({
  className,
  text = "Share to Twitter",
  tweetText
}: {
  className?: string;
  text?: string;
  tweetText: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("text", tweetText);
  return (
    <Button
      asChild
      className={cn("bg-[#1d9bf0] duration-300 hover:bg-[#0c7abf]", className)}
    >
      <a
        className="no-underline"
        href={`https://twitter.com/intent/tweet?${searchParams}`}
        rel="noreferrer noopener"
        target="_blank"
      >
        <Icon className="mr-2 h-5 w-5" name="twitter" />
        <span>{text}</span>
      </a>
    </Button>
  );
}
