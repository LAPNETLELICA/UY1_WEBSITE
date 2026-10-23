export type ContentType = "academic_information" | "general_announcement" | "event" | "research";
export type PublishingInput = {
  type: ContentType;
  title: string;
  description: string;
  status: "draft" | "published";
  imagePath: string;
  imagePaths: string[];
  startsAt?: string;
  endsAt?: string;
  location?: string;
  leadName?: string;
  researchAxis?: string;
};

export function getPublishingDestination(type: ContentType): {table: "news" | "events" | "research_projects"; category?: "Academic" | "General"; listingHref: string} {
  if (type === "academic_information") return { table: "news", category: "Academic", listingHref: "/news-events/academic-news" };
  if (type === "general_announcement") return { table: "news", category: "General", listingHref: "/news-events/general-news" };
  if (type === "event") return { table: "events", category: "General", listingHref: "/news-events/general-events" };
  return { table: "research_projects", listingHref: "/research" };
}

export function buildPublishingPayload(input: PublishingInput, existing?: {slug: string}): {table: "news" | "events" | "research_projects"; payload: Record<string, unknown>} {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) throw new Error("Title is required.");
  if (!description) throw new Error("Description is required.");
  if (input.type === "event" && (!input.startsAt || Number.isNaN(Date.parse(input.startsAt)))) throw new Error("Event start date is required.");
  const destination = getPublishingDestination(input.type);
  const slug = existing?.slug || title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const common = { slug, image_path: input.imagePath || null, image_paths: input.imagePaths, status: input.status };
  if (destination.table === "news") return {table: "news", payload: {...common, title, excerpt: description, body: description, category: destination.category, scope: "faculty", published_at: input.status === "published" ? new Date().toISOString() : null}};
  if (destination.table === "events") return {table: "events", payload: {...common, title, description, body: description, category: destination.category, scope: "faculty", starts_at: new Date(input.startsAt!).toISOString(), ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null, location: input.location || null}};
  return {table: "research_projects", payload: {...common, title, summary: description, details: description, scope: "faculty", lead_name: input.leadName || null, research_axis: input.researchAxis || ""}};
}
