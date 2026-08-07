"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  label: string;
  onChange: (file: File | null) => void;
}

export default function UploadBox({
  label,
  onChange,
}: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Validate file extension
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        setFile(droppedFile);
        onChange(droppedFile);
      } else {
        alert("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      onChange(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Format file size helper
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer transition-all hover:bg-slate-50 hover:border-blue-500/50 group",
          isDragActive && "border-blue-500 bg-blue-50/30 scale-[0.99]",
          file && "border-blue-500 bg-blue-50/10"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
        />

        {file ? (
          <div className="flex items-center gap-4 w-full px-2">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatBytes(file.size)}
              </p>
            </div>
            <button
              onClick={removeFile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-white p-3 text-slate-400 shadow-sm transition-transform group-hover:scale-110 border border-slate-100">
              <UploadCloud className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-950">
              Drag & drop Excel or CSV file
            </p>
            <p className="mt-1 text-xs text-slate-500">
              or <span className="text-blue-600 font-semibold underline group-hover:text-blue-700">browse files</span> from your device
            </p>
          </>
        )}
      </div>
    </div>
  );
}