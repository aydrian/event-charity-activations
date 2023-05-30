import type { LeadScore } from "@prisma/client";
import { titleCase } from "~/utils/misc";
import {
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  IdentificationIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

type LeadScoreIconProps = {
  score: LeadScore;
  className?: string;
};

export function LeadScoreIcon({ score, className = "" }: LeadScoreIconProps) {
  const title = titleCase(score);
  if (score === "BADGE_SCAN") {
    return (
      <LeadScoreIconWrapper
        title={title}
        bgColor="bg-red-500"
        className={className}
      >
        <IdentificationIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  if (score === "CONVERSATION") {
    return (
      <LeadScoreIconWrapper
        title={title}
        bgColor="bg-yellow-500"
        className={className}
      >
        <ChatBubbleBottomCenterTextIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  if (score === "MEETING_REQUESTED") {
    return (
      <LeadScoreIconWrapper
        title={title}
        bgColor="bg-green-500"
        className={className}
      >
        <CalendarDaysIcon className="aspect-square w-full text-gray-50" />
      </LeadScoreIconWrapper>
    );
  }
  return (
    <LeadScoreIconWrapper title={title} className={className}>
      <XCircleIcon className="aspect-square w-full text-gray-50" />
    </LeadScoreIconWrapper>
  );
}

type LeadScoreIconWrapperProps = {
  children: React.ReactNode;
  className?: string;
  title: string;
  bgColor?: string;
};

function LeadScoreIconWrapper({
  children,
  className = "",
  title,
  bgColor = "bg-gray-500"
}: LeadScoreIconWrapperProps) {
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
