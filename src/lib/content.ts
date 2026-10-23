import { createPublicClient } from "@/lib/supabase/public";

export type ContentRow = Record<string, any>;
export const DEPARTMENT_IMAGES: Record<string, string> = {
  "biological-sciences": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=85",
  chemistry: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1600&q=85",
  "computer-science": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  "earth-sciences": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=85",
  mathematics: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1600&q=85",
  physics: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=85",
  biochemistry: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1600&q=85",
  "animal-biology-and-physiology": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1600&q=85",
  "plant-biology-and-physiology": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1600&q=85",
  "inorganic-chemistry": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85",
  "organic-chemistry": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1600&q=85",
};
export const PAGE_BANNER_IMAGES: Record<string, string> = {
  about: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2200&q=85",
  programs: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2200&q=85",
  research: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2200&q=85",
  "news-events": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2200&q=85",
  departments: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=2200&q=85",
  gallery: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85",
  documents: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=2200&q=85",
  contact: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=85",
  services: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85",
  timetables: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=2200&q=85",
};
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
  else if (table === "research_projects") query = query.in("status", ["published", "completed"]);
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
