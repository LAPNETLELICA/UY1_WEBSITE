const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > -1) {
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: depts, error: dErr } = await supabase.from("departments").select("id, name, slug");
  console.log("Departments in DB:", depts, "Error:", dErr);

  const { data: specs, error: sErr } = await supabase.from("specializations").select("id, name, slug, department_id");
  console.log("Specializations count:", specs ? specs.length : 0, "Error:", sErr);

  const { data: tt, error: tErr } = await supabase.from("timetables").select("*");
  console.log("Timetables count in DB:", tt ? tt.length : 0, "Error:", tErr);
  if (tt && tt.length > 0) {
    console.log("Timetables sample:", JSON.stringify(tt.slice(0, 3), null, 2));
  }
}

run();

