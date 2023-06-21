import { PlusIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { Textarea, type TextareaProps } from "~/components/ui/textarea.tsx";
import { cn } from "~/utils/misc.ts";

import { Badge } from "./ui/badge.tsx";

type TemplateVariable = {
  className: string;
  displayName: string;
  value: string;
};

export interface TemplateEditorProps extends TextareaProps {
  variables: TemplateVariable[];
}

const TemplateEditor = React.forwardRef<
  HTMLTextAreaElement,
  TemplateEditorProps
>(({ variables, ...props }, forwardedRef) => {
  const ref = React.useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  React.useImperativeHandle(forwardedRef, () => ref.current);

  const insertAtCursor = (text: string) => {
    if (!ref.current) {
      return;
    }
    const start = ref.current.selectionStart;
    const end = ref.current.selectionEnd;
    const currentText = ref.current.value;
    ref.current.value =
      currentText.slice(0, start) + text + currentText.slice(end);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {variables.map((variable) => (
          <Badge
            className={cn(variable.className, "cursor-pointer")}
            key={variable.value}
            onClick={() => insertAtCursor(variable.value)}
            role="button"
          >
            <PlusIcon className="h-4 w-auto" />
            <span>{variable.displayName}</span>
          </Badge>
        ))}
      </div>
      <Textarea ref={ref} {...props} />
    </div>
  );
});
TemplateEditor.displayName = "TemplateEditor";

export { TemplateEditor };
