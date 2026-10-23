export function readFacultyInformationText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";
  const record = content as Record<string, unknown>;
  return typeof record.text === "string" ? record.text : typeof record.body === "string" ? record.body : "";
}

export function withFacultyInformationText(content: unknown, text: string): Record<string, unknown> {
  const previous = content && typeof content === "object" && !Array.isArray(content) ? content as Record<string, unknown> : {};
  return { ...previous, text };
}

export function getAboutBannerImage(rows: {key: string; content: unknown}[], fallback: string): string {
  const content = rows.find(row => row.key === "about_banner")?.content;
  if (!content || typeof content !== "object") return fallback;
  const image = (content as Record<string, unknown>).image_path;
  return typeof image === "string" && (image.startsWith("https://") || image.startsWith("/")) ? image : fallback;
}

export function getAboutText(rows: {key: string; content: unknown}[], key: string, fallback: string): string {
  const row = rows.find(item => item.key === key);
  return row ? readFacultyInformationText(row.content) || fallback : fallback;
}
