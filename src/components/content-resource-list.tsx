import { ArrowUpRight, FileText } from "lucide-react";
import { normalizeContentResources } from "@/lib/content-resources";

export function ContentResourceList({ resources }: { resources: unknown }) {
  const valid = Array.isArray(resources) ? resources.flatMap(item => { try { return normalizeContentResources([item]); } catch { return []; } }) : [];
  if (!valid.length) return null;
  return <section className="content-resource-list" aria-label="PDFs and useful links"><h2>PDFs and useful links</h2><ul>{valid.map((item, index) => <li key={`${item.url}-${index}`}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.kind === "pdf" ? <FileText size={17}/> : <ArrowUpRight size={17}/>}<span>{item.label}</span>{item.kind === "pdf" && <small>PDF</small>}</a></li>)}</ul></section>;
}
