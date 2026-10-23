"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Eye, Printer, Search } from "lucide-react";

type Department = { id: string; name: string };
type Specialty = { id: string; name: string; department_id: string };
type Timetable = {
  id: string; department_id: string | null; specialization_id: string | null; scope: "faculty" | "department" | "specialty";
  level: string; semester: string; academic_year: string; status: string; mime_type: string | null; storage_path: string | null;
  file_url: string | null; source_pdf_path: string | null; source_file_name: string | null; version_number: number;
};
type FileVersion = { id: string; timetable_id: string; version_number: number; storage_path: string; file_name: string; mime_type: string };
const semesters = ["Semester 1", "Semester 2"];
const noTimetable = "No timetable is currently available for this selection.";

export function TimetableSearch({ initialDepartment = "", initialSpecialty = "" }: { initialDepartment?: string; initialSpecialty?: string }) {
  const client = useMemo(() => createClient(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [department, setDepartment] = useState(initialDepartment);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [level, setLevel] = useState("");
  const [results, setResults] = useState<Timetable[] | null>(null);
  const [previewId, setPreviewId] = useState("");
  const [notice, setNotice] = useState("Select an academic year and semester to find a timetable.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void Promise.all([
      client.from("departments").select("id,name").eq("is_active", true).order("sort_order").order("name"),
      client.from("timetables").select("id,department_id,specialization_id,scope,level,semester,academic_year,status,mime_type,storage_path,file_url,source_pdf_path,source_file_name,version_number").eq("status", "published").order("academic_year", { ascending: false }),
      client.from("timetable_source_versions" as any).select("id,timetable_id,version_number,storage_path,file_name,mime_type").order("version_number", { ascending: false }),
    ]).then(([departmentResult, timetableResult, versionResult]) => {
      if (cancelled) return;
      if (departmentResult.error || timetableResult.error) { setNotice("Timetables are temporarily unavailable. Please try again later."); return; }
      setDepartments((departmentResult.data ?? []) as Department[]);
      setTimetables((timetableResult.data ?? []) as Timetable[]);
      setVersions((versionResult.data ?? []) as FileVersion[]);
    });
    return () => { cancelled = true; };
  }, [client]);

  useEffect(() => {
    if (!client || !department) { setSpecialties([]); setSpecialty(""); return; }
    let cancelled = false;
    void client.from("specializations").select("id,name,department_id").eq("department_id", department).eq("is_active", true).order("name")
      .then(({ data }) => {
        if (cancelled) return;
        const choices = (data ?? []) as Specialty[];
        setSpecialties(choices);
        if (specialty && !choices.some((item) => item.id === specialty)) setSpecialty("");
      });
    return () => { cancelled = true; };
  }, [client, department, specialty]);

  const contextualTables = useMemo(() => timetables.filter((item) => {
    const file = item.source_pdf_path || item.file_url || item.storage_path;
    if (!file) return false;
    if (item.scope !== "faculty" && !departments.some((row) => row.id === item.department_id)) return false;
    if (!department) return true;
    if (item.scope === "faculty") return false;
    if (item.department_id !== department) return false;
    return !specialty || item.scope === "department" || item.specialization_id === specialty;
  }), [timetables, departments, department, specialty]);
  const years = useMemo(() => Array.from(new Set(contextualTables.map((item) => item.academic_year))).sort((a, b) => b.localeCompare(a)), [contextualTables]);
  const levels = useMemo(() => Array.from(new Set(contextualTables.filter((item) =>
    (!academicYear || item.academic_year === academicYear) && (!semester || item.semester === semester),
  ).map((item) => item.level).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [contextualTables, academicYear, semester]);

  const viewTimetable = () => {
    if (!academicYear || !semester) { setNotice("Select an academic year and semester first."); setResults(null); return; }
    const matching = contextualTables.filter((item) => item.academic_year === academicYear && item.semester === semester && (!level || item.level === level));
    setResults(matching);
    setPreviewId("");
    setNotice(matching.length ? "" : noTimetable);
  };

  const publicFileUrl = (path: string | null) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return client?.storage.from("faculty-public").getPublicUrl(path).data.publicUrl ?? "";
  };
  const downloadUrl = (item: Timetable | FileVersion) => {
    const path = "timetable_id" in item ? item.storage_path : item.source_pdf_path || (item.storage_path && !/^https?:\/\//i.test(item.storage_path) ? item.storage_path : item.file_url || item.storage_path);
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return client?.storage.from("faculty-public").getPublicUrl(path, { download: true }).data.publicUrl ?? "";
  };
  const itemTitle = (item: Timetable) => [
    item.scope === "faculty" ? "General Faculty timetable" : departments.find((row) => row.id === item.department_id)?.name ?? "Department timetable",
    item.specialization_id ? specialties.find((row) => row.id === item.specialization_id)?.name : null,
    item.level, item.semester, item.academic_year,
  ].filter(Boolean).join(" · ");
  const printOne = (id: string) => {
    setPreviewId(id);
    window.setTimeout(() => { const frame = document.getElementById(`timetable-preview-${id}`) as HTMLIFrameElement | null; if (frame?.contentWindow) frame.contentWindow.print(); else window.print(); }, 250);
  };

  if (!client) return <div className="timetable-placeholder">Timetable search is not connected. Configure the public Supabase URL and publishable key.</div>;
  return <>
    <div className="timetable-form timetable-document-filters">
      <label>Academic Year<select value={academicYear} onChange={(event) => { setAcademicYear(event.target.value); setResults(null); }}><option value="">Select Academic Year</option>{years.map((year) => <option key={year} value={year}>{year.replace("-", "–")}</option>)}</select></label>
      <label>Semester<select value={semester} onChange={(event) => { setSemester(event.target.value); setResults(null); }}><option value="">Select Semester</option>{semesters.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Department<select value={department} onChange={(event) => { setDepartment(event.target.value); setSpecialty(""); setLevel(""); setResults(null); }}><option value="">All Faculty departments</option>{departments.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label>Specialty<select disabled={!department || specialties.length === 0} value={specialty} onChange={(event) => { setSpecialty(event.target.value); setLevel(""); setResults(null); }}><option value="">All department specialties</option>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Level<select value={level} onChange={(event) => { setLevel(event.target.value); setResults(null); }}><option value="">All levels</option>{levels.map((value) => <option key={value}>{value}</option>)}</select></label>
      <button className="button button-primary" onClick={viewTimetable}><Search size={15}/> View Timetable</button>
    </div>
    {results?.length ? <section className="timetable-results" aria-label="Matching timetables">
      <div className="timetable-result-heading"><div><p className="section-kicker">Faculty of Sciences Timetable</p><h2 className="section-heading">{academicYear.replace("-", "–")} · {semester}</h2><p>{results.length} timetable{results.length === 1 ? "" : "s"} match these filters.</p></div></div>
      <div className="timetable-document-list">{results.map((item) => {
        const source = item.source_pdf_path || item.file_url || item.storage_path;
        const previewUrl = publicFileUrl(source);
        const currentVersions = versions.filter((version) => version.timetable_id === item.id);
        const olderVersions = currentVersions.filter((version) => version.version_number < (item.version_number || 1));
        const isPdf = (item.mime_type ?? "application/pdf") === "application/pdf" || source?.toLowerCase().split("?")[0].endsWith(".pdf");
        const departmentName = item.department_id ? departments.find((entry) => entry.id === item.department_id)?.name : "Faculty-wide";
        const specialtyName = item.specialization_id ? specialties.find((entry) => entry.id === item.specialization_id)?.name : "";
        return <article className={`timetable-document-card ${previewId === item.id ? "print-target" : ""}`} key={item.id}>
          <div className="timetable-document-copy"><p className="section-kicker">{item.scope === "faculty" ? "General Faculty" : item.scope === "department" ? "Entire Department" : "Specific Specialty"}</p><h3>{itemTitle(item)}</h3><p>{departmentName}{specialtyName ? ` · ${specialtyName}` : ""} · {item.level}</p>{item.source_file_name && <small>File: {item.source_file_name} · Version {item.version_number || 1}</small>}</div>
          <div className="button-row timetable-document-actions"><button className="button button-quiet" onClick={() => setPreviewId(previewId === item.id ? "" : item.id)}><Eye size={15}/>{previewId === item.id ? "Hide preview" : "Preview Timetable"}</button><button className="button button-quiet" onClick={() => printOne(item.id)}><Printer size={15}/>Print</button><a className="button button-primary" href={downloadUrl(item)} download={item.source_file_name || undefined} target="_blank" rel="noreferrer"><Download size={15}/>Download</a></div>
          {previewId === item.id && <div className="timetable-document-preview">{previewUrl && isPdf ? <iframe id={`timetable-preview-${item.id}`} src={previewUrl} title={itemTitle(item)} /> : previewUrl ? <p>This document opens in a new tab. <a href={previewUrl} target="_blank" rel="noreferrer">Open {item.source_file_name || "timetable document"}</a></p> : <p>{noTimetable}</p>}</div>}
          {olderVersions.length > 0 && <details className="timetable-older-versions"><summary>Previous file versions</summary>{olderVersions.map((version) => <a key={version.id} href={downloadUrl(version)} download={version.file_name} target="_blank" rel="noreferrer">Version {version.version_number} · {version.file_name}</a>)}</details>}
        </article>;
      })}</div>
    </section> : <div className="timetable-placeholder">{notice}</div>}
  </>;
}
