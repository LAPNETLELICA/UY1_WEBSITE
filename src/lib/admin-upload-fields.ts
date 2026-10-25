export type AdminUploadKind = "image" | "document";

export function getAdminUploadKind(moduleKey: string, fieldKey: string): AdminUploadKind | null {
  if (fieldKey.includes("image") || (moduleKey === "media" && fieldKey === "public_url")) return "image";
  if (fieldKey === "storage_path" && (moduleKey === "documents" || moduleKey === "timetables")) return "document";
  return null;
}
