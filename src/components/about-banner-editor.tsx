"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAboutBannerImage, getAboutText, withFacultyInformationText } from "@/lib/faculty-information-content";

const aboutFields = [
  { key: "hero_title", label: "Page heading", fallback: "Science in service of society." },
  { key: "hero_description", label: "Page introduction", fallback: "Discover the Faculty’s identity, mission, vision and the departments that bring its scientific community together." },
  { key: "presentation_title", label: "Story heading", fallback: "Our story and purpose" },
  { key: "presentation", label: "Faculty presentation", fallback: "The Faculty of Science is part of the University of Yaoundé I, a public institution for higher education and research in Cameroon. Its academic community brings together teaching, scientific inquiry and service." },
  { key: "history", label: "History", fallback: "Across its disciplines, the Faculty prepares students to investigate important questions and apply scientific knowledge with integrity, imagination and care." },
  { key: "objectives", label: "Objectives", fallback: "Institutional history, objectives and official figures should be confirmed by the Faculty before publication." },
  { key: "mission", label: "Mission", fallback: "Deliver rigorous, relevant science education and advance research that responds to local and global challenges." },
  { key: "vision", label: "Vision", fallback: "A welcoming, connected centre of scientific learning, discovery and public service." },
  { key: "organization", label: "Organization", fallback: "Departments and specialties connect teaching, programmes, research and student resources." },
  { key: "departments_eyebrow", label: "Departments section label", fallback: "Academic organization" },
  { key: "departments_heading", label: "Departments section heading", fallback: "Our departments" },
  { key: "departments_description", label: "Departments section introduction", fallback: "Choose a department to explore its programmes, specialties, research and resources." },
] as const;

type AboutRow = { key: string; title?: string; content: unknown };

export function AboutBannerEditor({ fallbackImage }: { fallbackImage: string }) {
  const client = useMemo(() => createClient(), []);
  const [image, setImage] = useState(fallbackImage);
  const [rows, setRows] = useState<AboutRow[]>([]);
  const [copy, setCopy] = useState<Record<string, string>>(() => Object.fromEntries(aboutFields.map(field => [field.key, field.fallback])));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.from("faculty_information").select("key,title,content").in("key", ["about_banner", ...aboutFields.map(field => field.key)]).then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage(`Unable to load the About page: ${error.message}`);
      else {
        const loaded = data ?? [];
        setRows(loaded);
        setImage(getAboutBannerImage(loaded, fallbackImage));
        setCopy(Object.fromEntries(aboutFields.map(field => [field.key, getAboutText(loaded, field.key, field.fallback)])));
      }
    });
    return () => { active = false; };
  }, [client, fallbackImage]);

  async function upload(file?: File) {
    if (!file || !client) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setMessage("Choose a JPEG, PNG, or WebP image smaller than 20 MB.");
      return;
    }
    setSaving(true);
    setMessage("");
    const path = `faculty-information/about-banner-${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}`;
    const { error: uploadError } = await client.storage.from("faculty-public").upload(path, file, { contentType: file.type });
    if (uploadError) { setMessage(`Unable to upload the image: ${uploadError.message}`); setSaving(false); return; }
    const url = client.storage.from("faculty-public").getPublicUrl(path).data.publicUrl;
    const { error: saveError } = await client.from("faculty_information").upsert({
      key: "about_banner", title: "About page banner", content: { image_path: url }, is_public: true,
    }, { onConflict: "key" });
    if (saveError) setMessage(`Unable to save the About image: ${saveError.message}`);
    else { setImage(url); setRows(previous => [...previous.filter(row => row.key !== "about_banner"), { key: "about_banner", title: "About page banner", content: { image_path: url } }]); setMessage("About page image saved. Refresh the About page to see it."); }
    setSaving(false);
  }

  async function saveCopy() {
    if (!client) return;
    if (aboutFields.some(field => !copy[field.key]?.trim())) { setMessage("Complete every About page text field before saving."); return; }
    setSaving(true);
    setMessage("");
    const updates = aboutFields.map(field => {
      const old = rows.find(row => row.key === field.key);
      return { key: field.key, title: old?.title || field.label, content: withFacultyInformationText(old?.content, copy[field.key].trim()), is_public: true };
    });
    const { data, error } = await client.from("faculty_information").upsert(updates, { onConflict: "key" }).select("key,title,content");
    if (error) setMessage(`Unable to save About page text: ${error.message}`);
    else { setRows(previous => [...previous.filter(row => row.key === "about_banner"), ...(data ?? [])]); setMessage("About page text saved. Refresh the About page to see it."); }
    setSaving(false);
  }

  return <section className="about-banner-editor" id="about-banner-editor" aria-labelledby="about-banner-heading">
    <div><p className="section-kicker">About page</p><h2 id="about-banner-heading">Image and content</h2><p>Edit the About page heading, sections, and banner image here.</p></div>
    <img src={image} alt="Current About page banner" />
    <label><span>Upload a new banner image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => void upload(event.target.files?.[0])} /></label>
    <div className="about-content-fields">{aboutFields.map(field => <label key={field.key}><span>{field.label}</span>{["hero_title", "presentation_title"].includes(field.key) ? <input value={copy[field.key] ?? ""} onChange={event => setCopy(previous => ({ ...previous, [field.key]: event.target.value }))} /> : <textarea rows={3} value={copy[field.key] ?? ""} onChange={event => setCopy(previous => ({ ...previous, [field.key]: event.target.value }))} />}</label>)}</div>
    <button className="button button-primary" type="button" disabled={saving} onClick={() => void saveCopy()}>Save About page content</button>
    {saving && <p>Uploading and saving image…</p>}
    {message && <p className={`admin-notice ${message.startsWith("Unable") || message.startsWith("Choose") ? "is-error" : "is-success"}`} role="status">{message}</p>}
  </section>;
}
