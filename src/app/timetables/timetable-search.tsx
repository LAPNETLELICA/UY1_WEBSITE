"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, FileDown, Printer, Search } from "lucide-react";

type Department = { id: string; name: string };
type Specialty = { id: string; name: string; department_id: string };
type Timetable = {
  id: string; department_id: string | null; specialization_id: string | null; scope: string;
  level: string; semester: string; academic_year: string; status: string;
  storage_path: string | null; file_url: string | null; source_pdf_path: string | null;
  source_file_name: string | null; version_number: number;
};
type SourceVersion = { id: string; timetable_id: string; version_number: number; storage_path: string; file_name: string; uploaded_at: string };
type Entry = {
  id: string; timetable_id: string; department_id: string | null; specialization_id: string | null;
  level: string | null; class_date: string | null; course_name: string; course_code: string | null;
  teacher: string | null; room: string | null; day_of_week: number; start_time: string; end_time: string;
  review_required: boolean; timetable: Pick<Timetable, "department_id" | "specialization_id" | "scope" | "level" | "semester" | "academic_year">;
};
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const noTimetable = "No timetable is currently available for this selection.";

export function TimetableSearch({ initialDepartment = "", initialSpecialty = "" }: { initialDepartment?: string; initialSpecialty?: string }) {
  const client = useMemo(() => createClient(), []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sourceVersions, setSourceVersions] = useState<SourceVersion[]>([]);
  const [department, setDepartment] = useState(initialDepartment);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [notice, setNotice] = useState("Choose any available filters, then select View timetable.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void Promise.all([
      client.from("departments").select("id,name").eq("is_active", true).order("sort_order").order("name"),
      client.from("timetables").select("id,department_id,specialization_id,scope,level,semester,academic_year,status,storage_path,file_url,source_pdf_path,source_file_name,version_number").eq("status", "published").order("academic_year", { ascending: false }),
    ]).then(([departmentResult, timetableResult]) => {
      if (cancelled) return;
      if (departmentResult.error || timetableResult.error) {
        setNotice("Timetables are temporarily unavailable. Please try again later.");
        return;
      }
      setDepartments((departmentResult.data ?? []) as Department[]);
      setTimetables((timetableResult.data ?? []) as Timetable[]);
    });
    return () => { cancelled = true; };
  }, [client]);

  useEffect(() => {
    if (!client || !department) { setSpecialties([]); return; }
    let cancelled = false;
    void client.from("specializations").select("id,name,department_id").eq("department_id", department).eq("is_active", true).order("name")
      .then(({ data }) => { if (!cancelled) setSpecialties((data ?? []) as Specialty[]); });
    return () => { cancelled = true; };
  }, [client, department]);

  const contextualTimetables = useMemo(() => timetables.filter((item) => {
    if (department && item.department_id !== department && item.scope !== "faculty") return false;
    if (specialty && item.specialization_id !== specialty && item.scope !== "faculty") return false;
    return true;
  }), [timetables, department, specialty]);
  const valuesFor = (key: "academic_year" | "semester" | "level") => Array.from(new Set(contextualTimetables.map((item) => item[key]).filter(Boolean))).sort((a, b) => key === "academic_year" ? b.localeCompare(a) : a.localeCompare(b));
  const years = valuesFor("academic_year");
  const semesters = valuesFor("semester");
  const levels = valuesFor("level");

  const viewTimetable = async () => {
    if (!client) { setNotice("Timetable lookup is not connected. Configure the public Supabase URL and publishable key."); return; }
    setLoading(true); setEntries([]); setSourceVersions([]); setNotice("");
    const candidates = contextualTimetables.filter((item) =>
      (!academicYear || item.academic_year === academicYear) &&
      (!semester || item.semester === semester) &&
      (!level || item.level === level),
    );
    if (!candidates.length) { setNotice(noTimetable); setLoading(false); return; }
    const { data, error } = await client.from("timetable_entries").select("id,timetable_id,department_id,specialization_id,level,class_date,course_name,course_code,teacher,room,day_of_week,start_time,end_time,review_required,timetable:timetables!inner(department_id,specialization_id,scope,level,semester,academic_year)").in("timetable_id", candidates.map((item) => item.id)).order("day_of_week").order("start_time");
    if (error) { setNotice("Could not load this timetable. Please retry."); setLoading(false); return; }
    const ids = candidates.map((item) => item.id);
    const { data: versionData } = await client.from("timetable_source_versions" as any).select("id,timetable_id,version_number,storage_path,file_name,uploaded_at").in("timetable_id", ids).order("version_number", { ascending: false });
    setSourceVersions((versionData ?? []) as SourceVersion[]);
    const found = ((data ?? []) as unknown as Entry[]).filter((entry) => {
      const parent = entry.timetable;
      const rowDepartment = entry.department_id ?? parent.department_id;
      const rowSpecialty = entry.specialization_id ?? parent.specialization_id;
      const rowLevel = entry.level || parent.level;
      return !entry.review_required && (!department || rowDepartment === department) &&
        (!specialty || rowSpecialty === specialty) &&
        (!level || rowLevel === level);
    });
    setEntries(found);
    setNotice(found.length ? "" : noTimetable);
    setLoading(false);
  };

  const selectedTimetables = useMemo(() => {
    const ids = new Set(entries.map((entry) => entry.timetable_id));
    return timetables.filter((item) => ids.has(item.id));
  }, [entries, timetables]);

  const downloadStructured = () => {
    if (!entries.length) return;
    const csvCell = (value: string | number | null | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const heading = ["Academic year", "Semester", "Department", "Specialty", "Level", "Date", "Day", "Start", "End", "Course code", "Course", "Teacher", "Room"];
    const rows = entries.map((entry) => {
      const parent = entry.timetable;
      return [parent.academic_year, parent.semester,
        departments.find((item) => item.id === (entry.department_id ?? parent.department_id))?.name ?? "Faculty-wide",
        specialties.find((item) => item.id === (entry.specialization_id ?? parent.specialization_id))?.name ?? "",
        entry.level || parent.level, entry.class_date ?? "", days[entry.day_of_week - 1] ?? "", entry.start_time, entry.end_time,
        entry.course_code ?? "", entry.course_name, entry.teacher ?? "", entry.room ?? ""];
    });
    const csv = [heading, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = href;
    anchor.download = `faculty-sciences-timetable-${academicYear || "all-years"}.csv`.replace(/\s+/g, "-");
    anchor.click(); URL.revokeObjectURL(href);
  };

  const originalPdfUrl = (item: Pick<Timetable, "source_pdf_path" | "file_url" | "storage_path"> | SourceVersion) => {
    const source = "source_pdf_path" in item ? item.source_pdf_path || item.file_url || item.storage_path : item.storage_path;
    if (!source) return "";
    return /^https?:\/\//i.test(source) ? source : client?.storage.from("faculty-public").getPublicUrl(source).data.publicUrl ?? "";
  };
  const openOriginalPdf = (item: Timetable) => {
    const url = originalPdfUrl(item);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return <>
    <div className="timetable-form">
      <label>Academic year<select value={academicYear} onChange={(event) => { setAcademicYear(event.target.value); setEntries([]); }}><option value="">All available years</option>{years.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Semester<select value={semester} onChange={(event) => { setSemester(event.target.value); setEntries([]); }}><option value="">All available semesters</option>{semesters.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Department<select value={department} onChange={(event) => { setDepartment(event.target.value); setSpecialty(""); setLevel(""); setEntries([]); }}><option value="">All Faculty departments</option>{departments.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label>Specialty<select disabled={!department || specialties.length === 0} value={specialty} onChange={(event) => { setSpecialty(event.target.value); setLevel(""); setEntries([]); }}><option value="">All specialties</option>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Level<select value={level} onChange={(event) => { setLevel(event.target.value); setEntries([]); }}><option value="">All available levels</option>{levels.map((value) => <option key={value}>{value}</option>)}</select></label>
      <button className="button button-primary" onClick={viewTimetable} disabled={loading}>{loading ? "Loading…" : <><Search size={15}/> View timetable</>}</button>
    </div>
    {entries.length > 0 ? <div className="timetable-results">
      <div className="timetable-result-heading"><div><p className="section-kicker">Faculty of Sciences · {academicYear || "All years"} · {semester || "All semesters"}</p><h2 className="section-heading">{department ? departments.find((item) => item.id === department)?.name : "General Faculty Timetable"}{specialty ? ` · ${specialties.find((item) => item.id === specialty)?.name ?? ""}` : ""}{level ? ` · ${level}` : ""}</h2><p>{entries.length} structured timetable entr{entries.length === 1 ? "y" : "ies"}</p></div>
        <div className="button-row"><button className="button button-primary" onClick={downloadStructured}><Download size={15}/> Download timetable (CSV)</button><button className="text-link" onClick={() => window.print()}><Printer size={15}/> Print timetable</button></div>
      </div>
      <div className="timetable-table-scroll"><table className="timetable-table"><thead><tr><th>Date / day</th><th>Time</th><th>Department · Specialty · Level</th><th>Course</th><th>Room</th><th>Teacher</th></tr></thead><tbody>{entries.map((entry) => {
        const parent = entry.timetable;
        return <tr key={entry.id}><td>{entry.class_date ? new Date(`${entry.class_date}T12:00:00`).toLocaleDateString() : days[entry.day_of_week - 1] ?? "—"}</td><td>{entry.start_time.slice(0, 5)}–{entry.end_time.slice(0, 5)}</td><td>{departments.find((item) => item.id === (entry.department_id ?? parent.department_id))?.name ?? "Faculty-wide"}{specialties.find((item) => item.id === (entry.specialization_id ?? parent.specialization_id))?.name ? ` · ${specialties.find((item) => item.id === (entry.specialization_id ?? parent.specialization_id))?.name}` : ""} · {entry.level || parent.level}</td><td>{entry.course_code ? `${entry.course_code} · ` : ""}{entry.course_name}</td><td>{entry.room || "—"}</td><td>{entry.teacher || "—"}</td></tr>;
      })}</tbody></table></div>
      <div className="original-pdf-list"><strong>Original official PDF versions</strong>{sourceVersions.length ? sourceVersions.map((version) => <button key={version.id} className="text-link" onClick={() => openOriginalPdf(version)}><FileDown size={15}/>{version.file_name} · version {version.version_number}</button>) : selectedTimetables.map((item) => <button key={item.id} className="text-link" onClick={() => openOriginalPdf(item)}><FileDown size={15}/>{item.source_file_name || `View original PDF · version ${item.version_number}`}</button>)}</div>
    </div> : <div className="timetable-placeholder">{notice}</div>}
  </>;
}
