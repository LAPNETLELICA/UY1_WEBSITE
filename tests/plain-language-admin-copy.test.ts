import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("administrator screens use plain language instead of implementation names", () => {
  const workspace = source("src/components/admin-workspace.tsx");
  const adminPage = source("src/app/admin/page.tsx");
  const publisher = source("src/components/faculty-publishing-editor.tsx");
  const timetable = source("src/app/timetables/timetable-search.tsx");

  assert.doesNotMatch(workspace, /French translations \(JSON\)|must be valid JSON/);
  assert.match(workspace, /French version/);
  assert.match(source("src/app/admin/admin-language.css"), /Faculty content/);
  assert.doesNotMatch(adminPage, /Connect Supabase|Supabase Auth/);
  assert.doesNotMatch(publisher, /Faculty CMS/);
  assert.doesNotMatch(timetable, /public Supabase URL and publishable key/);
});

test("application copy excludes the unwanted personal name", () => {
  const applicationFiles = [
    "src/components/admin-workspace.tsx",
    "src/components/faculty-publishing-editor.tsx",
    "src/app/admin/page.tsx",
  ];

  const unwantedName = new RegExp(["ja", "son"].join(""), "i");
  for (const path of applicationFiles) assert.doesNotMatch(source(path), unwantedName, path);
});
