import type { ActionArgs, UploadHandler } from "@remix-run/node";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";
import SVG from "react-inlinesvg";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { requireUserId } from "~/utils/auth.server";

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
  await requireUserId(request);

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const svgString = formData.get("fileUpload")?.toString() || "";

  return json({ svgString });
};

type UploaderProps = {
  name: string;
  className?: string;
  UploadIcon?: typeof DocumentPlusIcon;
  fileTypes?: string;
  maxFileSize?: string;
  multiple?: boolean;
  defaultValue?: string;
};

export function FileUploader({
  name,
  className = "",
  defaultValue = "",
  fileTypes,
  multiple = false,
  UploadIcon = DocumentPlusIcon,
  maxFileSize = "1MB"
}: UploaderProps) {
  const fetcher = useFetcher<typeof action>();
  const svgString = fetcher.data?.svgString || defaultValue;
  const [draggingOver, setDraggingOver] = React.useState(false);

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
    <div
      className={`${
        draggingOver ? "border-4 border-yellow-300" : "border-2 border-gray-400"
      } not-prose border-rounded flex items-center justify-center rounded border-dashed transition duration-300 ease-in-out ${className}`}
      onDragEnter={() => setDraggingOver(true)}
      onDragLeave={() => setDraggingOver(false)}
      onDrag={preventDefaults}
      onDragStart={preventDefaults}
      onDragEnd={preventDefaults}
      onDragOver={preventDefaults}
      onDrop={handleDrop}
    >
      {svgString ? (
        <SVG
          src={svgString}
          className="aspect-auto h-full text-brand-deep-purple"
        />
      ) : (
        <div className="pointer-events-none flex select-none flex-col items-center">
          <UploadIcon
            title="Upload File"
            className="h-12 w-12 text-gray-500"
            aria-hidden="true"
          />
          <p className="text-xl text-gray-700">Drop file to upload</p>
          <p className="mb-2 text-gray-700">or</p>
          <label className="pointer-events-auto inline-flex h-9 cursor-pointer items-center rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
            Select file
            <input
              type="file"
              accept={fileTypes}
              onChange={handleChange}
              className="sr-only"
              multiple={multiple}
            />
          </label>
          <p className="mt-4 text-xs text-gray-600">
            Maximum upload file size: {maxFileSize}.
          </p>
        </div>
      )}
      <input type="hidden" name={name} value={svgString} />
    </div>
  );
}
