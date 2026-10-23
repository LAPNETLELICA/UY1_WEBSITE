"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAboutBannerImage } from "@/lib/faculty-information-content";

export function AboutBannerEditor({ fallbackImage }: { fallbackImage: string }) {
  const client = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(fallbackImage);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.from("faculty_information").select("key,content").eq("key", "about_banner").maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage(`Unable to load the About image: ${error.message}`);
      else setImage(getAboutBannerImage(data ? [data] : [], fallbackImage));
    });
    const open = () => inputRef.current?.click();
    window.addEventListener("edit-about-banner", open);
    return () => { active = false; window.removeEventListener("edit-about-banner", open); };
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
    else { setImage(url); setMessage("About page image saved. Refresh the About page to see it."); }
    setSaving(false);
  }

  return <section className="about-banner-editor" id="about-banner-editor" aria-labelledby="about-banner-heading">
    <div><p className="section-kicker">About page</p><h2 id="about-banner-heading">Banner image</h2><p>This image appears behind the title at the top of the About page.</p></div>
    <img src={image} alt="Current About page banner" />
    <label><span>Upload a new banner image</span><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => void upload(event.target.files?.[0])} /></label>
    {saving && <p>Uploading and saving image…</p>}
    {message && <p className={`admin-notice ${message.startsWith("Unable") || message.startsWith("Choose") ? "is-error" : "is-success"}`} role="status">{message}</p>}
  </section>;
}
