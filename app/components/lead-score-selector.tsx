import { LeadScore } from "@prisma/client";

import { LeadScoreIcon } from "./lead-score-icon.tsx";

type LeadScoreSelectorProps = {
  defaultSelected?: LeadScore;
  label: string;
  name: string;
};

export function LeadScoreSelector({
  defaultSelected = "BADGE_SCAN",
  label,
  name
}: LeadScoreSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex justify-stretch gap-4 md:h-full md:w-8 md:shrink md:flex-col md:justify-evenly">
        {Object.entries(LeadScore).map(([key, value], index) => {
          return (
            <div className="flex" key={`${key}${index}`}>
              <input
                className="peer sr-only"
                defaultChecked={key === defaultSelected}
                id={`${key}${index}`}
                name={name}
                type="radio"
                value={value}
              />
              <label
                className="hover:border-1 cursor-pointer overflow-hidden rounded-lg hover:border-yellow-500 peer-checked:border-transparent peer-checked:ring-4 peer-checked:ring-black md:peer-checked:ring-2"
                htmlFor={`${key}${index}`}
              >
                <LeadScoreIcon className="p-1" score={value} />
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
