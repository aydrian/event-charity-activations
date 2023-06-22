import type { LeadScore } from "@prisma/client";

import {
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  IdentificationIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

import { titleCase } from "~/utils/misc.ts";

type LeadScoreIconProps = {
  className?: string;
  score: LeadScore;
};

export function LeadScoreIcon({ className = "", score }: LeadScoreIconProps) {
  const title = titleCase(score);
  if (score === "BADGE_SCAN") {
    return (
      <LeadScoreIconWrapper
        bgColor="bg-red-500"
        className={className}
        title={title}
      >
        <IdentificationIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  if (score === "CONVERSATION") {
    return (
      <LeadScoreIconWrapper
        bgColor="bg-yellow-500"
        className={className}
        title={title}
      >
        <ChatBubbleBottomCenterTextIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  if (score === "MEETING_REQUESTED") {
    return (
      <LeadScoreIconWrapper
        bgColor="bg-green-500"
        className={className}
        title={title}
      >
        <CalendarDaysIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  return (
    <LeadScoreIconWrapper className={className} title={title}>
      <XCircleIcon className="aspect-square w-full text-gray-50" />
    </LeadScoreIconWrapper>
  );
}

type LeadScoreIconWrapperProps = {
  bgColor?: string;
  children: React.ReactNode;
  className?: string;
  title: string;
};

function LeadScoreIconWrapper({
  bgColor = "bg-gray-500",
  children,
  className = "",
  title
}: LeadScoreIconWrapperProps) {
  return (
    <div
      className={`flex aspect-square items-center ${bgColor} ${className}`}
      title={title}
    >
      <>
        <span className="sr-only">{title}</span>
        {children}
      </>
    </div>
  );
}
