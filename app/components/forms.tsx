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

import { Button, type ButtonProps } from "./ui/button.tsx";
import { Checkbox, type CheckboxProps } from "./ui/checkbox.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Textarea } from "./ui/textarea.tsx";

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
    <ul className="flex flex-col gap-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-brand-danger text-[10px]" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}

export const Field = React.forwardRef<
  HTMLInputElement,
  {
    className?: string;
    errors?: ListOfErrors;
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  }
>(({ className, errors, inputProps, labelProps }, ref) => {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
        ref={ref}
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
});
Field.displayName = "Field";

export function OldField({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
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
  textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        {...labelProps}
        className="font-bold text-brand-deep-purple"
      />
      <Textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        placeholder=" "
        {...textareaProps}
      ></Textarea>
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
    <div className={clsx("flex flex-col gap-1", className)}>
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
    <div className={clsx("flex flex-col gap-1", className)}>
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
  buttonProps,
  className,
  errors,
  labelProps
}: {
  buttonProps: CheckboxProps;
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // To emulate native events that Conform listen to:
  // See https://conform.guide/integrations
  const control = useInputEvent({
    // Retrieve the checkbox element by name instead as Radix does not expose the internal checkbox element
    onFocus: () => buttonRef.current?.focus(),
    // See https://github.com/radix-ui/primitives/discussions/874
    ref: () =>
      buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? "")
  });
  const id = buttonProps.id ?? buttonProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Label
          className="font-bold text-brand-deep-purple"
          htmlFor={id}
          {...labelProps}
        />
        <Checkbox
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={id}
          ref={buttonRef}
          {...buttonProps}
          onBlur={(event) => {
            control.blur();
            buttonProps.onBlur?.(event);
          }}
          onCheckedChange={(state) => {
            control.change(Boolean(state.valueOf()));
            buttonProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            control.focus();
            buttonProps.onFocus?.(event);
          }}
          type="button"
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
}: ButtonProps & {
  state?: "idle" | "loading" | "submitting";
  submittingText?: string;
}) {
  return (
    <Button
      {...props}
      className={clsx(
        props.className,
        "bg-brand-electric-purple duration-300 hover:bg-brand-electric-purple/90 disabled:bg-brand-electric-purple/50"
      )}
      disabled={props.disabled || state !== "idle"}
    >
      {state !== "idle" ? submittingText : props.children}
    </Button>
  );
}
