import { createPublicClient } from "@/lib/supabase/public";

export type ContentRow = Record<string, any>;
export const DEPARTMENT_FALLBACKS:ContentRow[]=[
  {id:"",name:"Biological Sciences",slug:"biological-sciences",description:"From molecular biology to ecosystem stewardship, exploring life at every scale.",mission:"Study life and living systems, from molecules to ecosystems."},
  {id:"",name:"Chemistry",slug:"chemistry",description:"Building foundational and applied knowledge for a changing world.",mission:"Advance chemical knowledge through teaching, research and practical application."},
  {id:"",name:"Computer Science",slug:"computer-science",description:"Developing computational thinking, technology and digital innovation.",mission:"Develop computational thinking and digital innovation for society."},
  {id:"",name:"Earth Sciences",slug:"earth-sciences",description:"Understanding the planet, its resources and its dynamic systems.",mission:"Understand Earth systems, resources and environmental change."},
  {id:"",name:"Mathematics",slug:"mathematics",description:"Advancing the language of patterns, logic and quantitative discovery.",mission:"Advance mathematical knowledge and its applications."},
  {id:"",name:"Physics",slug:"physics",description:"Investigating the principles that shape matter, energy and the universe.",mission:"Explore the principles governing matter, energy and the universe."},
];
export async function getPublicRows(table: string, select = "*") {
  const client = createPublicClient();
  if (!client) return [] as ContentRow[];
  const relationSelect = table === "gallery_items" ? "*,department:departments(name,slug),specialty:specializations(name,slug),related_event:events(title,slug),related_research:research_projects(title,slug)" : "*,department:departments(name,slug),specialty:specializations(name,slug)";
  let query = client.from(table).select(select === "*" ? relationSelect : select).order("created_at", { ascending: false }).limit(30);
  if (table === "programs") query = query.eq("is_active", true);
  else query = query.eq("status", "published");
  const { data } = await query;
  return (data ?? []) as ContentRow[];
}
export async function getActiveDepartments() {
  const client = createPublicClient();
  if (!client) return DEPARTMENT_FALLBACKS;
  const { data } = await client.from("departments").select("*").eq("is_active", true).order("sort_order").order("name");
  return data?.length ? data as ContentRow[] : DEPARTMENT_FALLBACKS;
}
export function toSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
