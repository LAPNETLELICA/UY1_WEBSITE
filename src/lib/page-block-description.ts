export function readPageBlockDescription(content: unknown): string {
  if (!content || typeof content !== "object" || Array.isArray(content)) return "";
  const record = content as Record<string, unknown>;
  for (const key of ["description", "body", "text"]) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  return "";
}

export function withPageBlockDescription(previous: unknown, description: string): Record<string, unknown> {
  const record = previous && typeof previous === "object" && !Array.isArray(previous)
    ? previous as Record<string, unknown> : {};
  return { ...record, description };
}
