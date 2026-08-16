import React from "react";
import { FileText, ArrowUpRight } from "lucide-react";

export type UploadDropZoneProps = {
  selectedFile: string | null;
  scanState: "idle" | "scanning" | "matched" | "fallback";
  onFileDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ArabicUploadDropZone({
  selectedFile,
  scanState,
  onFileDrop,
  onFileChange,
}: UploadDropZoneProps) {
  return (
    <label
      className={`drop-zone ${scanState !== "idle" ? "has-file" : ""} ${scanState === "scanning" ? "is-scanning-laser" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onFileDrop}
    >
      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFileChange} />
      <span className="drop-symbol">
        <FileText size={24} />
      </span>
      <span className="drop-copy">
        <b>{selectedFile || "اختر أو أضف سيرتك الذاتية"}</b>
        <small>{selectedFile ? "الفحص المحلي نشط — يبقى ملفك داخل هذا المتصفح" : "PDF أو DOC أو DOCX أو TXT"}</small>
      </span>
      <span className="drop-arrow">
        <ArrowUpRight size={20} />
      </span>
    </label>
  );
}
