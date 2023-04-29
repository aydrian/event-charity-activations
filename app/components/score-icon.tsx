import { LeadScore } from "@prisma/client";
import { titleCase } from "~/utils";
import {
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  IdentificationIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

type ScoreIconProps = {
  score: LeadScore;
  className?: string;
};

export function ScoreIcon({ score, className = "" }: ScoreIconProps) {
  const title = titleCase(score);
  if (score === "BADGE_SCAN") {
    return (
      <ScoreIconWrapper
        title={title}
        bgColor="bg-red-500"
        className={className}
      >
        <IdentificationIcon className="aspect-square w-full text-gray-50" />
      </ScoreIconWrapper>
    );
  }
  if (score === "CONVERSATION") {
    return (
      <ScoreIconWrapper
        title={title}
        bgColor="bg-yellow-500"
        className={className}
      >
        <ChatBubbleBottomCenterTextIcon className="aspect-square w-full text-gray-50" />
      </ScoreIconWrapper>
    );
  }
  if (score === "MEETING_REQUESTED") {
    return (
      <ScoreIconWrapper
        title={title}
        bgColor="bg-green-500"
        className={className}
      >
        <CalendarDaysIcon className="aspect-square w-full text-gray-50" />
      </ScoreIconWrapper>
    );
  }
  return (
    <ScoreIconWrapper title={title} className={className}>
      <XCircleIcon className="aspect-square w-full text-gray-50" />
    </ScoreIconWrapper>
  );
}

type ScoreIconWrapperProps = {
  children: React.ReactNode;
  className?: string;
  title: string;
  bgColor?: string;
};

function ScoreIconWrapper({
  children,
  className = "",
  title,
  bgColor = "bg-gray-500"
}: ScoreIconWrapperProps) {
  return (
    <div
      title={title}
      className={`flex aspect-square items-center ${bgColor} ${className}`}
    >
      <>
        <span className="sr-only">{title}</span>
        {children}
      </>
    </div>
  );
}
