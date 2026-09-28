"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Printer, Search } from "lucide-react";

type Department = { id: string; name: string };
type Specialty = { id: string; name: string; department_id: string };
type Timetable = { id: string; department_id: string; program_id: string; specialization_id?: string | null; level: string; semester: string; academic_year: string; status: string };
type Entry = { id: string; course_name: string; teacher: string | null; room: string | null; day_of_week: number; start_time: string; end_time: string };
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableSearch({initialDepartment="",initialSpecialty=""}:{initialDepartment?:string;initialSpecialty?:string}) {
  const client = createClient();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [department, setDepartment] = useState(initialDepartment);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [timetableId, setTimetableId] = useState("");
  const [notice, setNotice] = useState("Choose your department and study details to look up a published timetable.");
  const selected = timetables.find((item) => item.id === timetableId);

  useEffect(() => {
    if (!client) return;
    client.from("departments").select("id,name").eq("is_active", true).order("name").then(({ data, error }) => {
      if (error) setNotice("Timetables are temporarily unavailable. Please try again later.");
      if (data) setDepartments(data);
    });
  }, [client]);

  useEffect(() => {
    if (!client || !department) { setSpecialties([]); setSpecialty(""); return; }
    client.from("specializations").select("id,name,department_id").eq("department_id", department).eq("is_active", true).order("name").then(({ data }) => setSpecialties(data ?? []));
  }, [client, department]);

  useEffect(() => {
    if (!client || !department) { setTimetables([]); setTimetableId(""); return; }
    setLevel(""); setSemester(""); setAcademicYear("");
    let query = client.from("timetables").select("id,department_id,program_id,specialization_id,level,semester,academic_year,status").eq("department_id", department).eq("status", "published");
    if (specialty) query = query.eq("specialization_id", specialty);
    query.order("academic_year", { ascending: false }).then(({ data }) => {
      setTimetables(data ?? []); setTimetableId("");
      if (!data?.length) setNotice("No published timetable is available for this department yet. Please check again with your department.");
    });
  }, [client, department, specialty]);

  useEffect(() => {
    const match = timetables.find((item) => item.level === level && item.semester === semester && item.academic_year === academicYear && (!specialty || item.specialization_id === specialty));
    setTimetableId(match?.id ?? "");
  }, [timetables, level, semester, academicYear, specialty]);

  useEffect(() => {
    if (!client || !timetableId) { setEntries([]); return; }
    client.from("timetable_entries").select("id,course_name,teacher,room,day_of_week,start_time,end_time").eq("timetable_id", timetableId).order("day_of_week").order("start_time").then(({ data, error }) => {
      setEntries(data ?? []);
      setNotice(error ? "Could not load this timetable. Please retry." : data?.length ? "" : "This published timetable does not have any class entries yet.");
    });
  }, [client, timetableId]);

  if (!client) return <div className="timetable-placeholder">Timetable lookup is not connected yet. Faculty administrators: configure the Supabase URL and public anon key to enable live timetable data.</div>;
  return <>
    <div className="timetable-form">
      <label>Department<select value={department} onChange={(e) => { setDepartment(e.target.value); setSpecialty(""); setLevel(""); setSemester(""); setAcademicYear(""); }}><option value="">Select department</option>{departments.map((item)=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label>Specialty<select disabled={!department || specialties.length===0} value={specialty} onChange={(e)=>setSpecialty(e.target.value)}><option value="">All specialties</option>{specialties.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Level<select disabled={!department} value={level} onChange={(e)=>setLevel(e.target.value)}><option value="">Select level</option>{Array.from(new Set(timetables.map((x)=>x.level))).map((value)=><option key={value}>{value}</option>)}</select></label>
      <label>Semester<select disabled={!department} value={semester} onChange={(e)=>setSemester(e.target.value)}><option value="">Select semester</option>{Array.from(new Set(timetables.map((x)=>x.semester))).map((value)=><option key={value}>{value}</option>)}</select></label>
      <label>Academic year<select disabled={!department} value={academicYear} onChange={(e)=>setAcademicYear(e.target.value)}><option value="">Select year</option>{Array.from(new Set(timetables.map((x)=>x.academic_year))).map((value)=><option key={value}>{value}</option>)}</select></label>
      <button className="button" style={{background:"var(--purple)",color:"white",border:0}} onClick={() => selected ? window.print() : setNotice("Please select a published timetable first.")}><Search size={15}/> Find timetable</button>
    </div>
    {entries.length > 0 ? <div className="timetable-results"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><p className="section-kicker">{selected?.academic_year} · {selected?.semester}</p><h2 className="section-heading" style={{fontSize:30}}>{departments.find((d)=>d.id===department)?.name}{specialty?` · ${specialties.find(s=>s.id===specialty)?.name??""}`:""} · {selected?.level}</h2></div><button className="text-link" onClick={()=>window.print()}><Printer size={15}/> Print timetable</button></div><div className="simple-list">{days.map((day,index)=>{const dayEntries=entries.filter((entry)=>entry.day_of_week===index+1);return dayEntries.length>0?<article key={day}><h3>{day}</h3>{dayEntries.map((entry)=><p key={entry.id}><strong>{entry.start_time.slice(0,5)}–{entry.end_time.slice(0,5)} · {entry.course_name}</strong><br/>{entry.room ? `Room: ${entry.room}` : "Room to be confirmed"}{entry.teacher ? ` · ${entry.teacher}` : ""}</p>)}</article>:null})}</div></div> : <div className="timetable-placeholder">{notice}</div>}
  </>;
}
