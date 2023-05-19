import { ErrorList, type ListOfErrors } from "~/utils/forms";
import { hexToRgbA } from "~/utils";

type CharityPickerProps = {
  name: string;
  charities: { id: string; name: string; color: string }[];
  label?: string;
  errors?: ListOfErrors;
};

export function CharityPicker({
  charities,
  label,
  name,
  errors
}: CharityPickerProps) {
  const errorId = errors?.length ? `${name}-error` : undefined;
  return (
    <fieldset name={name} role="radiogroup">
      {label ? (
        <legend className="mb-4 font-bold text-brand-deep-purple">
          {label}
        </legend>
      ) : null}
      <div className="mx-2 flex flex-col gap-3">
        {charities.map((charity, index) => (
          <div key={charity.id} className="flex justify-items-stretch gap-1">
            <input
              id={`charity-${index}`}
              type="radio"
              name={name}
              value={charity.id}
              defaultChecked={index === 0}
              className="peer sr-only"
            />
            <label
              htmlFor={`charity-${index}`}
              className="grow cursor-pointer rounded-lg border border-gray-300 bg-white p-5 text-center text-2xl font-bold hover:bg-gray-50 focus:outline-none peer-checked:ring-4 peer-checked:ring-brand-focus peer-checked:ring-offset-4"
              style={{
                backgroundColor: hexToRgbA(charity.color, 0.5)
              }}
            >
              {charity.name}
            </label>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </fieldset>
  );
}
