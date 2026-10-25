export type ContentResource = { label: string; url: string; kind: "pdf" | "link" };

export function normalizeContentResources(value: unknown): ContentResource[] {
  if (value == null || value === "") return [];
  if (!Array.isArray(value)) throw new Error("Resources must be a list.");
  if (value.length > 20) throw new Error("Add no more than 20 resources.");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Each resource needs a label and URL.");
    const candidate = entry as Record<string, unknown>;
    const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
    const url = typeof candidate.url === "string" ? candidate.url.trim() : "";
    const kind = candidate.kind;
    if (!label || label.length > 120) throw new Error("Each resource needs a label of 1–120 characters.");
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new Error("Each resource needs a valid HTTP or HTTPS URL."); }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Each resource needs a valid HTTP or HTTPS URL.");
    if (kind !== "pdf" && kind !== "link") throw new Error("Choose PDF or link for each resource.");
    if (kind === "pdf" && !parsed.pathname.toLowerCase().endsWith(".pdf")) throw new Error("PDF resources must link to a PDF file.");
    return { label, url, kind };
  });
}
