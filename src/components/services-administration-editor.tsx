"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PAGE_BANNER_IMAGES } from "@/lib/content";
import { facultyLeaders } from "@/lib/department-media";
import { mergeServicesPageContent, resolveServicesPageContent, validateServicesPageContent, type ServicesPageContent, type ServiceLeader } from "@/lib/services-page-content";
import { validateServicesImage } from "@/lib/services-image-upload";

const draftKey = "uy1-services-page-draft";
const fields: { key: keyof Omit<ServicesPageContent, "leaders" | "bannerImage">; label: string; long?: boolean }[] = [
  { key: "homeEyebrow", label: "Home section label" },
  { key: "homeHeading", label: "Home section heading" },
  { key: "homeIntroduction", label: "Home section introduction", long: true },
  { key: "pageHeading", label: "Services page heading" },
  { key: "pageIntroduction", label: "Services page introduction", long: true },
  { key: "sectionHeading", label: "Directory heading" },
  { key: "sectionDescription", label: "Directory description", long: true },
];

export function ServicesAdministrationEditor({ departments, onEditDepartment }: {
  departments: { id: string; name: string; head_name?: string | null; head_title?: string | null }[];
  onEditDepartment: (id: string) => void;
}) {
  const client = useMemo(() => createClient(), []);
  const fallback = useMemo(() => resolveServicesPageContent(null, PAGE_BANNER_IMAGES.services, facultyLeaders), []);
  const [draft, setDraft] = useState<ServicesPageContent>(fallback);
  const [original, setOriginal] = useState<unknown>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!client) { setMessage("Unable to connect to the content database."); setError(true); setLoadFailed(true); setReady(true); return; }
    let active = true;
    void Promise.resolve(client.from("faculty_information").select("key,title,content").eq("key", "services_page").maybeSingle()).then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) { setMessage(`Unable to load the Services page: ${loadError.message}`); setError(true); setLoadFailed(true); }
      if (data) setHasSaved(true);
      setOriginal(data?.content ?? null);
      let next = resolveServicesPageContent(data?.content, PAGE_BANNER_IMAGES.services, facultyLeaders);
      try {
        const stored = sessionStorage.getItem(draftKey);
        if (stored) { next = resolveServicesPageContent(JSON.parse(stored), PAGE_BANNER_IMAGES.services, facultyLeaders); setDirty(true); }
      } catch { /* Ignore invalid browser-only drafts. */ }
      setDraft(next);
      setReady(true);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setMessage(`Unable to load the Services page: ${loadError instanceof Error ? loadError.message : String(loadError)}`);
      setError(true); setLoadFailed(true); setReady(true);
    });
    return () => { active = false; };
  }, [client]);

  useEffect(() => {
    if (!ready || !dirty) return;
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, dirty, ready]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change(patch: Partial<ServicesPageContent>) { setDraft(previous => ({ ...previous, ...patch })); setDirty(true); setMessage(""); }
  function changeLeader(index: number, patch: Partial<ServiceLeader>) {
    change({ leaders: draft.leaders.map((leader, at) => at === index ? { ...leader, ...patch } : leader) });
  }
  function moveLeader(index: number, direction: -1 | 1) {
    const next = [...draft.leaders];
    const other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    change({ leaders: next });
  }
  async function upload(file: File | undefined, leaderIndex?: number) {
    if (!file || !client || loadFailed) return;
    const validation = validateServicesImage(file);
    if (validation) { setMessage(validation); setError(true); return; }
    setBusy(true); setMessage("");
    const path = `faculty-information/services-${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}`;
    const { error: uploadError } = await client.storage.from("faculty-public").upload(path, file, { contentType: file.type });
    if (uploadError) { setMessage(`Unable to upload the image: ${uploadError.message}`); setError(true); setBusy(false); return; }
    const url = client.storage.from("faculty-public").getPublicUrl(path).data.publicUrl;
    if (leaderIndex === undefined) change({ bannerImage: url });
    else changeLeader(leaderIndex, { imagePath: url });
    setMessage("Image uploaded. Save page content to publish it."); setError(false); setBusy(false);
  }
  async function save() {
    if (!client || loadFailed) return;
    const validation = validateServicesPageContent(draft);
    if (validation) { setMessage(validation); setError(true); return; }
    setBusy(true); setMessage("");
    const content = mergeServicesPageContent(original, draft);
    let saveError: { message: string } | null;
    try {
      const result = await client.from("faculty_information").upsert({
        key: "services_page", title: "Services and administration page", content, is_public: true,
      }, { onConflict: "key" });
      saveError = result.error;
    } catch (cause) { saveError = { message: cause instanceof Error ? cause.message : String(cause) }; }
    if (saveError) { setMessage(`Unable to save the Services page: ${saveError.message}`); setError(true); }
    else { setOriginal(content); setHasSaved(true); setDirty(false); sessionStorage.removeItem(draftKey); setMessage("Services page saved. Refresh the public page to see it."); setError(false); }
    setBusy(false);
  }

  return <section className="services-admin-editor" aria-labelledby="services-admin-title">
    <div className="services-admin-heading"><div><p className="section-kicker">Services et administration de la faculté</p><h2 id="services-admin-title">Manage the Services page</h2><p>Edit the home feature, Services page, leadership and banner here. Service cards remain in the records below.</p></div><a className="text-link" href="/services" target="_blank" rel="noreferrer">View public page ↗</a></div>
    {!ready ? <p>Loading Services page…</p> : <>
      <div className="services-admin-fields">{fields.map(field => <label key={field.key}><span>{field.label}</span>{field.long ? <textarea rows={3} value={draft[field.key]} onChange={event => change({ [field.key]: event.target.value })}/> : <input value={draft[field.key]} onChange={event => change({ [field.key]: event.target.value })}/>}</label>)}</div>
      <div className="services-admin-media"><div><h3>Page banner</h3><img src={draft.bannerImage} alt="Services page banner preview"/><label><span>Upload banner image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || loadFailed} onChange={event => void upload(event.target.files?.[0])}/></label></div></div>
      <div className="services-admin-subheading"><div><h3>Faculty leadership</h3><p>Rector, Dean and other leaders shown on the Services page.</p></div><button type="button" className="button button-quiet" onClick={() => change({ leaders: [...draft.leaders, { role: "", name: "", summary: "", imagePath: "" }] })}>Add leader</button></div>
      <div className="services-admin-leaders">{draft.leaders.map((leader, index) => <article key={index}><div className="services-admin-leader-actions"><strong>Leader {index + 1}</strong><div><button type="button" disabled={index === 0} onClick={() => moveLeader(index, -1)}>Move up</button><button type="button" disabled={index === draft.leaders.length - 1} onClick={() => moveLeader(index, 1)}>Move down</button><button type="button" onClick={() => change({ leaders: draft.leaders.filter((_, at) => at !== index) })}>Remove</button></div></div>{leader.imagePath && <img src={leader.imagePath} alt={`${leader.name || "Leader"} portrait preview`}/>}<div className="services-admin-fields"><label><span>Role</span><input value={leader.role} onChange={event => changeLeader(index, { role: event.target.value })}/></label><label><span>Name</span><input value={leader.name} onChange={event => changeLeader(index, { name: event.target.value })}/></label><label><span>Summary</span><textarea rows={3} value={leader.summary} onChange={event => changeLeader(index, { summary: event.target.value })}/></label><label><span>Upload portrait</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || loadFailed} onChange={event => void upload(event.target.files?.[0], index)}/></label></div></article>)}</div>
      <div className="services-admin-subheading"><div><h3>Department heads</h3><p>These entries come from Departments. Edit a department to update its head and portrait.</p></div></div><div className="services-admin-departments">{departments.map(department => <div key={department.id}><span><strong>{department.name}</strong><small>{department.head_name || "No head assigned"}{department.head_title ? ` · ${department.head_title}` : ""}</small></span><button type="button" onClick={() => onEditDepartment(department.id)}>Edit department</button></div>)}</div>
      {message && <p role="status" className={`admin-notice ${error ? "is-error" : "is-success"}`}>{message}</p>}
      <div className="services-admin-save"><span>{loadFailed ? "Page could not be loaded" : dirty ? "Unsaved page changes" : hasSaved ? "Page content is saved" : "Default content is shown; save to publish changes"}</span><button className="button button-primary" type="button" disabled={busy || loadFailed} onClick={() => void save()}>{busy ? "Working…" : "Save Services page"}</button></div>
    </>}
  </section>;
}
