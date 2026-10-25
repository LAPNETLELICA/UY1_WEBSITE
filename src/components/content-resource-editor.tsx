"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContentResource } from "@/lib/content-resources";

type Props = {
  value: ContentResource[];
  onChange: (value: ContentResource[]) => void;
  uploadFolder: string;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

export function ContentResourceEditor({ value, onChange, uploadFolder, disabled = false, onBusyChange }: Props) {
  const client = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const update = (index: number, changes: Partial<ContentResource>) => onChange(value.map((item, at) => at === index ? { ...item, ...changes } : item));
  const uploadPdf = async (file?: File) => {
    if (!file || !client) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) { setError("Choose a PDF file."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("PDF files must be 20 MB or smaller."); return; }
    setUploading(true); onBusyChange?.(true); setError("");
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      const path = `${uploadFolder}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await client.storage.from("faculty-public").upload(path, file, { contentType: "application/pdf" });
      if (uploadError) throw uploadError;
      const url = client.storage.from("faculty-public").getPublicUrl(path).data.publicUrl;
      onChange([...value, { label: file.name.replace(/\.pdf$/i, ""), url, kind: "pdf" }]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "PDF upload failed."); }
    finally { setUploading(false); onBusyChange?.(false); }
  };
  return <div className="content-resource-editor">
    <strong>PDFs and useful links</strong>
    <p>Attach PDFs or labeled web links to this page. Save the content to publish them.</p>
    {value.map((item, index) => <div className="content-resource-row" key={index}>
      <input aria-label={`Resource ${index + 1} label`} placeholder="Link label" value={item.label} disabled={disabled || uploading} onChange={event => update(index, { label: event.target.value })}/>
      <input aria-label={`Resource ${index + 1} URL`} type="url" placeholder="https://…" value={item.url} disabled={disabled || uploading} onChange={event => update(index, { url: event.target.value })}/>
      <span>{item.kind === "pdf" ? "PDF" : "Link"}</span>
      <button type="button" disabled={disabled || uploading} onClick={() => onChange(value.filter((_, at) => at !== index))}>Remove</button>
    </div>)}
    <div className="content-resource-actions"><button type="button" disabled={disabled || uploading || value.length >= 20} onClick={() => onChange([...value, { label: "", url: "", kind: "link" }])}>Add useful link</button><label>Upload PDF<input type="file" accept="application/pdf,.pdf" disabled={disabled || uploading || value.length >= 20} onChange={event => { void uploadPdf(event.target.files?.[0]); event.target.value = ""; }}/></label></div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
