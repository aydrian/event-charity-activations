import type { ActionArgs, UploadHandler } from "@remix-run/node";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";
import SVG from "react-inlinesvg";
import { requireUser } from "~/services/auth.server";

const uploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
  contentType
}) => {
  console.log({ name, filename, contentType });
  let chunks = [];
  for await (let chunk of data) {
    chunks.push(chunk);
  }
  return await new Blob(chunks, { type: contentType }).text();
};

export const action = async ({ request }: ActionArgs) => {
  await requireUser(request);

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const svgString = formData.get("fileUpload")?.toString() || "";

  return json({ svgString });
};

type UploaderProps = {
  name: string;
  label: string;
  className?: string;
};

export function FileUploader({ name, label, className }: UploaderProps) {
  const fetcher = useFetcher<typeof action>();
  const id = `${name}-${React.useId()}`;
  const svgString = fetcher.data?.svgString || "";
  const [draggingOver, setDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = (file: File) => {
    let inputFormData = new FormData();
    inputFormData.append("fileUpload", file);
    fetcher.submit(inputFormData, {
      method: "POST",
      action: "/resources/upload",
      encType: "multipart/form-data"
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      handleFileUpload(event.currentTarget.files[0]);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="font-bold !text-brand-deep-purple">
        {label}
      </label>
      <div
        className={`${
          draggingOver
            ? "border-rounded border-4 border-dashed border-yellow-300"
            : ""
        } group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded bg-gray-400 transition duration-300 ease-in-out hover:bg-gray-500`}
        onDragEnter={() => setDraggingOver(true)}
        onDragLeave={() => setDraggingOver(false)}
        onDrag={preventDefaults}
        onDragStart={preventDefaults}
        onDragEnd={preventDefaults}
        onDragOver={preventDefaults}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {svgString ? (
          <SVG
            src={svgString}
            className="h-full w-full text-brand-deep-purple"
          />
        ) : (
          <p className="pointer-events-none z-10 cursor-pointer select-none text-4xl font-extrabold text-gray-200 transition duration-300 ease-in-out group-hover:opacity-0">
            +
          </p>
        )}
        <input
          id={id}
          type="file"
          accept=".svg"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
        />
        <input type="hidden" name={name} value={svgString} />
      </div>
    </div>
  );
}
