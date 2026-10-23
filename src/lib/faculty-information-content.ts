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
