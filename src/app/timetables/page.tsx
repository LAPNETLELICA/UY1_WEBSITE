import type { Metadata } from "next";
import { TimetableSearch } from "./timetable-search";
export const metadata: Metadata = { title: "Student timetables", description: "Find a published class timetable by department, specialty, level, semester and academic year." };
export default async function TimetablesPage({searchParams}:{searchParams:Promise<{department?:string;specialty?:string}>}) {
  const selected=await searchParams;
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker">Student services</p><h1>Find your timetable.</h1><p>Choose your department and specialty, then select a level, semester and academic year to view the latest published class schedule. No student login is needed.</p></div></section><section className="content-section"><div className="wrap"><TimetableSearch initialDepartment={selected.department??""} initialSpecialty={selected.specialty??""}/></div></section></>;
}
