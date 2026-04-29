import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  file: File | null;
  onFileSelected: (file: File) => void;
  onClearFile: () => void;
}

export function UploadZone({
  file,
  onFileSelected,
  onClearFile,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type === "application/pdf") {
        onFileSelected(dropped);
      }
    },
    [onFileSelected],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected && selected.type === "application/pdf") {
        onFileSelected(selected);
      }
    },
    [onFileSelected],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full border-2 border-dashed rounded-xl flex items-center justify-center text-center transition-colors h-full min-h-[240px]",
          isDragging
            ? "border-purple bg-purple/10"
            : "border-border hover:border-purple/50",
        )}
      >
        {file ? (
          <div className="flex flex-col items-center gap-3 px-6">
            <FileText size={32} className="text-purple-mid" />
            <span className="text-sm font-medium text-primary truncate max-w-full">
              {file.name}
            </span>
            <button
              type="button"
              onClick={onClearFile}
              aria-label="Remove file"
              className="text-xs text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <X size={14} />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-3 px-6 py-10"
          >
            <Upload size={32} className="text-purple-mid" />
            <span className="text-sm font-medium text-primary">
              Drop your resume here or click to browse
            </span>
            <span className="text-xs text-muted">PDF only · max 10MB</span>
          </button>
        )}
      </div>
    </>
  );
}
