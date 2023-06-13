import { ErrorList, type ListOfErrors } from "~/utils/forms";
import { hexToRgbA } from "~/utils/misc";

type CharityPickerProps = {
  charities: { color: string; id: string; name: string }[];
  errors?: ListOfErrors;
  label?: string;
  name: string;
};

export function CharityPicker({
  charities,
  errors,
  label,
  name
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
          <div className="flex justify-items-stretch gap-1" key={charity.id}>
            <input
              className="peer sr-only"
              defaultChecked={index === 0}
              id={`charity-${index}`}
              name={name}
              type="radio"
              value={charity.id}
            />
            <label
              style={{
                backgroundColor: hexToRgbA(charity.color, 0.5)
              }}
              className="grow cursor-pointer rounded-lg border border-gray-300 bg-white p-5 text-center text-2xl font-bold hover:bg-gray-50 focus:outline-none peer-checked:ring-4 peer-checked:ring-brand-focus peer-checked:ring-offset-4"
              htmlFor={`charity-${index}`}
            >
              {charity.name}
            </label>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </fieldset>
  );
}
