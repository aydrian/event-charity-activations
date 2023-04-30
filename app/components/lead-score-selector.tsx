import { LeadScore } from "@prisma/client";
import { LeadScoreIcon } from "./lead-score-icon";

type LeadScoreSelectorProps = {
  label: string;
  name: string;
  defaultSelected?: LeadScore;
};

export function LeadScoreSelector({
  label,
  name,
  defaultSelected = "BADGE_SCAN"
}: LeadScoreSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex justify-stretch gap-4 md:h-full md:w-8 md:shrink md:flex-col md:justify-evenly">
        {Object.entries(LeadScore).map(([key, value], index) => {
          return (
            <div key={`${key}${index}`} className="flex">
              <input
                id={`${key}${index}`}
                type="radio"
                name={name}
                value={value}
                defaultChecked={key === defaultSelected}
                className="peer sr-only"
              />
              <label
                htmlFor={`${key}${index}`}
                className="hover:border-1 cursor-pointer overflow-hidden rounded-lg hover:border-yellow-500 peer-checked:border-transparent peer-checked:ring-4 peer-checked:ring-black md:peer-checked:ring-2"
              >
                <LeadScoreIcon score={value} className="p-1" />
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
