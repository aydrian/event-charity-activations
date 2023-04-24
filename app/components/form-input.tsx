import { useField } from "remix-validated-form";

type FormInputProps = {
  name: string;
  label: string;
};

export const FormInput = ({
  name,
  label,
  ...rest
}: FormInputProps & React.HTMLProps<HTMLInputElement>) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1 font-bold !text-brand-deep-purple">
          {label}
        </span>
        <input
          {...getInputProps({
            id: name,
            className:
              "p-2 rounded-none border-b border-b-brand-deep-purple font-normal !text-brand-gray",
            ...rest
          })}
        />
      </label>
      {error ? (
        <div className="pt-1 text-sm text-red-700">{error}</div>
      ) : undefined}
    </div>
  );
};
