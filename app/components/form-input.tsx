import { forwardRef } from "react";
import { useField } from "remix-validated-form";

type FormInputProps = {
  name: string;
  label: string;
  className?: string;
};

export const FormInput = forwardRef<
  HTMLInputElement,
  FormInputProps & React.HTMLProps<HTMLInputElement>
>(function FormInput({ name, label, className, ...rest }, ref) {
  const { error, getInputProps } = useField(name);
  return (
    <div className={className}>
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1 font-bold !text-brand-deep-purple">
          {label}
        </span>
        <input
          {...getInputProps({
            id: name,
            className:
              "p-2 rounded-none border-b border-b-brand-deep-purple font-normal !text-brand-gray",
            ref,
            ...rest
          })}
        />
      </label>
      {error ? (
        <div className="pt-1 text-sm text-red-700">{error}</div>
      ) : undefined}
    </div>
  );
});
