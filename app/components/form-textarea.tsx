import { forwardRef } from "react";
import { useField } from "remix-validated-form";

type FormTextAreaProps = {
  name: string;
  label: string;
  className?: string;
};

export const FormTextArea = forwardRef<
  HTMLTextAreaElement,
  FormTextAreaProps & React.HTMLProps<HTMLTextAreaElement>
>(function FormTextArea({ name, label, className, ...rest }, ref) {
  const { error, getInputProps } = useField(name);
  return (
    <div className={className}>
      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1 font-bold !text-brand-deep-purple">
          {label}
        </span>
        <textarea
          {...getInputProps({
            id: name,
            className:
              "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900",
            ref,
            ...rest
          })}
        ></textarea>
      </label>
      {error ? (
        <div className="pt-1 text-sm text-red-700">{error}</div>
      ) : undefined}
    </div>
  );
});
