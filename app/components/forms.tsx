import { useInputEvent } from "@conform-to/react";
import { clsx } from "clsx";
import React, { useId, useRef } from "react";

import {
  TemplateEditor,
  type TemplateEditorProps
} from "~/components/template-editor.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";

import { Label } from "./ui/label.tsx";

export type ListOfErrors = Array<null | string | undefined> | null | undefined;

export function ErrorList({
  errors,
  id
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul className="space-y-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-brand-danger text-xs" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}

export function Field({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: Omit<JSX.IntrinsicElements["input"], "className">;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...inputProps}
        className="!text-brand-gray rounded-none border-b border-b-brand-deep-purple p-2 font-normal"
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TextareaField({
  className,
  errors,
  labelProps,
  textareaProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: Omit<JSX.IntrinsicElements["textarea"], "className">;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...textareaProps}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
      ></textarea>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TemplateEditorField({
  className,
  errors,
  labelProps,
  templateEditorProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  templateEditorProps: TemplateEditorProps;
}) {
  const fallbackId = useId();
  const id = templateEditorProps.id ?? templateEditorProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <TemplateEditor
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...templateEditorProps}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
      ></TemplateEditor>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SelectField({
  buttonProps,
  className,
  errors,
  labelProps,
  options
}: {
  buttonProps: SelectProps;
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const control = useInputEvent({
    onFocus: () => buttonRef.current?.focus(),
    ref: () =>
      buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? "")
  });
  const fallbackId = useId();
  const id = buttonProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const { name, ...props } = buttonProps;

  return (
    <div className={clsx("flex flex-col", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Select
        defaultValue={
          buttonProps.defaultValue
            ? String(buttonProps.defaultValue)
            : undefined
        }
        name={name}
        onOpenChange={setOpen}
        open={open}
      >
        <SelectTrigger
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={id}
          ref={buttonRef}
          {...props}
          onBlur={(event) => {
            control.blur();
            buttonProps.onBlur?.(event);
          }}
          onChange={(state) => {
            control.change(state.currentTarget.value);
            buttonProps.onChange?.(state);
          }}
          onFocus={(event) => {
            control.focus();
            buttonProps.onFocus?.(event);
          }}
          type="button"
        >
          <SelectValue placeholder={labelProps.children} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function CheckboxField({
  checkboxProps,
  className,
  errors,
  labelProps
}: {
  checkboxProps: Omit<JSX.IntrinsicElements["input"], "className" | "type"> & {
    type?: string;
  };
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = checkboxProps.id ?? checkboxProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex flex-row gap-1">
        <Label
          htmlFor={id}
          {...labelProps}
          className="font-bold text-brand-deep-purple"
        />
        <input
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={id}
          {...checkboxProps}
          type="checkbox"
          value="on"
        />
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  state = "idle",
  submittingText = "Submitting...",
  ...props
}: React.ComponentPropsWithRef<"button"> & {
  state?: "idle" | "loading" | "submitting";
  submittingText?: string;
}) {
  return (
    <button
      {...props}
      className={clsx(
        props.className,
        "rounded bg-brand-electric-purple text-xl font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50"
      )}
      disabled={props.disabled || state !== "idle"}
    >
      <span>{state === "submitting" ? submittingText : props.children}</span>
    </button>
  );
}
