"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPublishingPayload, getPublishingDestination, type ContentType, type PublishingInput } from "@/lib/faculty-publishing";
import { ContentResourceEditor } from "@/components/content-resource-editor";
import type { ContentResource } from "@/lib/content-resources";

type SavedItem = { id: string; sourceTable: "news" | "events" | "research_projects"; type: ContentType; title: string; slug: string; excerpt?: string; body?: string; description?: string; summary?: string; details?: string; image_path?: string | null; image_paths?: string[]; resource_links?: ContentResource[]; status: "draft" | "published"; starts_at?: string; ends_at?: string; location?: string; lead_name?: string; research_axis?: string };
const emptyDraft: PublishingInput = {type: "academic_information", title: "", description: "", status: "draft", imagePath: "", imagePaths: [], resourceLinks: []};
const choices: [ContentType, string][] = [["academic_information", "Academic information"], ["general_announcement", "General announcement"], ["event", "Event"], ["research", "Research"]];

export function FacultyPublishingEditor() {
  const client = createClient();
  const [rows, setRows] = useState<SavedItem[]>([]);
  const [draft, setDraft] = useState<PublishingInput>(emptyDraft);
  const [editing, setEditing] = useState<SavedItem | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = <K extends keyof PublishingInput>(key: K, value: PublishingInput[K]) => setDraft(previous => ({...previous, [key]: value}));
  const refresh = useCallback(async () => {
    if (!client) return;
    const [news, events, research] = await Promise.all([
      client.from("news").select("*").limit(100),
      client.from("events").select("*").limit(100),
      client.from("research_projects").select("*").limit(100),
    ]);
    const items: SavedItem[] = [
      ...(news.data ?? []).map((row: any) => ({...row, sourceTable: "news" as const, type: row.category === "Academic" ? "academic_information" as const : "general_announcement" as const})),
      ...(events.data ?? []).map((row: any) => ({...row, sourceTable: "events" as const, type: "event" as const})),
      ...(research.data ?? []).map((row: any) => ({...row, sourceTable: "research_projects" as const, type: "research" as const})),
    ];
    setRows(items.sort((a, b) => String((b as any).created_at ?? "").localeCompare(String((a as any).created_at ?? ""))));
  }, [client]);
  useEffect(() => { void refresh(); }, [refresh]);
  const startNew = () => {setDraft({...emptyDraft, imagePaths: [], resourceLinks: []});setEditing(null);setMessage("");setOpen(true);};
  const startEdit = (row: SavedItem) => {
    setEditing(row);
    setDraft({type: row.type, title: row.title, description: row.body || row.details || row.description || row.summary || row.excerpt || "", status: row.status, imagePath: row.image_path || "", imagePaths: row.image_paths || [], resourceLinks: row.resource_links || [], startsAt: row.starts_at ? row.starts_at.slice(0, 16) : "", endsAt: row.ends_at ? row.ends_at.slice(0, 16) : "", location: row.location || "", leadName: row.lead_name || "", researchAxis: row.research_axis || ""});
    setMessage("");setOpen(true);
  };
  const upload = async (files: FileList | null, cover: boolean) => {
    if (!files?.length || !client) return;
    const selected = cover ? [files[0]] : Array.from(files);
    if (selected.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024)) {setMessage("Choose JPEG, PNG, or WebP images under 20 MB each.");return;}
    setSaving(true);setMessage("");
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const path = `faculty-publishing/${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}`;
        const {error} = await client.storage.from("faculty-public").upload(path, file, {contentType: file.type});
        if (error) throw error;
        urls.push(client.storage.from("faculty-public").getPublicUrl(path).data.publicUrl);
      }
      if (cover) update("imagePath", urls[0]);
      else setDraft(previous => ({...previous, imagePaths: [...previous.imagePaths, ...urls]}));
    } catch (error) {setMessage(error instanceof Error ? error.message : "Image upload failed.");}
    finally {setSaving(false);}
  };
  const save = async () => {
    if (!client) return;
    let result: ReturnType<typeof buildPublishingPayload>;
    try {result = buildPublishingPayload(draft, editing ? {slug: editing.slug} : undefined);}
    catch (error) {setMessage(error instanceof Error ? error.message : "Check the form.");return;}
    setSaving(true);setMessage("");
    const request = editing ? client.from(result.table).update(result.payload).eq("id", editing.id) : client.from(result.table).insert(result.payload);
    const {error} = await request;
    if (error) setMessage(`${error.message}${error.code ? ` (${error.code})` : ""}`);
    else {setMessage("Saved successfully.");setOpen(false);await refresh();}
    setSaving(false);
  };
  const destination = getPublishingDestination(draft.type);
  return <main className="admin-main faculty-publishing"><div className="admin-topbar"><div><p className="section-kicker">Faculty CMS</p><h1>Publish content</h1><p>Create news, events, and research for the Faculty website.</p></div><button className="button button-primary" onClick={startNew}>New content</button></div>
    {message && <p className={`admin-notice ${message === "Saved successfully." ? "is-success" : "is-error"}`}>{message}</p>}
    <div className="admin-publishing-list">{rows.map(row => <article className="admin-record" key={`${row.sourceTable}-${row.id}`}><div className="admin-record-copy"><span className="section-kicker">{choices.find(([type]) => type === row.type)?.[1]}</span><h2>{row.title}</h2><p>{row.excerpt || row.summary || row.description}</p><small>{row.status}</small></div><button className="button button-quiet" onClick={() => startEdit(row)}>Edit</button></article>)}</div>
    {open && <div className="admin-editor-backdrop" onMouseDown={event => {if(event.target === event.currentTarget)setOpen(false);}}><section className="admin-editor" aria-label="Publish content"><div className="editor-heading"><div><p className="section-kicker">{editing ? "Edit content" : "Create content"}</p><h2>{editing?.title || "New Faculty content"}</h2></div><button aria-label="Close editor" onClick={() => setOpen(false)}>×</button></div><div className="editor-fields">
      <label><span>Content type *</span><select value={draft.type} disabled={!!editing} onChange={event => update("type", event.target.value as ContentType)}>{choices.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label><span>Title *</span><input value={draft.title} onChange={event => update("title", event.target.value)}/></label>
      <label className="publishing-wide"><span>Description *</span><textarea rows={6} value={draft.description} onChange={event => update("description", event.target.value)} placeholder="Describe what you want to publish"/></label>
      {draft.type === "event" && <><label><span>Event start date *</span><input type="datetime-local" value={draft.startsAt || ""} onChange={event => update("startsAt", event.target.value)}/></label><label><span>Event end date</span><input type="datetime-local" value={draft.endsAt || ""} onChange={event => update("endsAt", event.target.value)}/></label><label><span>Location</span><input value={draft.location || ""} onChange={event => update("location", event.target.value)}/></label></>}
      {draft.type === "research" && <><label><span>Researcher</span><input value={draft.leadName || ""} onChange={event => update("leadName", event.target.value)}/></label><label><span>Research area</span><input value={draft.researchAxis || ""} onChange={event => update("researchAxis", event.target.value)}/></label></>}
      <div className="publishing-wide publishing-images"><strong>Images</strong><label><span>Cover image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => void upload(event.target.files, true)}/></label>{draft.imagePath && <div className="publishing-thumbnail"><img src={draft.imagePath} alt="Selected cover"/><button onClick={() => update("imagePath", "")}>Remove</button></div>}<label><span>Additional images</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => void upload(event.target.files, false)}/></label><div className="publishing-gallery">{draft.imagePaths.map((url,index) => <div className="publishing-thumbnail" key={url}><img src={url} alt={`Additional image ${index + 1}`}/><button onClick={() => update("imagePaths", draft.imagePaths.filter(item => item !== url))}>Remove</button></div>)}</div></div>
      <ContentResourceEditor value={draft.resourceLinks || []} onChange={resources => update("resourceLinks", resources)} uploadFolder="faculty-publishing/resources" disabled={saving} onBusyChange={setSaving}/>
      <label><span>Publication status</span><select value={draft.status} onChange={event => update("status", event.target.value as PublishingInput["status"])}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    </div><div className="editor-preview"><p className="section-kicker">Destination preview</p><h3>{draft.title || "Content title"}</h3><p>{draft.description || "Your description will appear here."}</p><small>Faculty home page and {destination.listingHref}</small></div>{message && message !== "Saved successfully." && <p className="admin-notice is-error">{message}</p>}<div className="editor-actions"><button className="button button-quiet" onClick={() => setOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save content"}</button></div></section></div>}
  </main>;
}
