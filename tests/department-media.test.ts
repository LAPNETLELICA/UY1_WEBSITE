import assert from "node:assert/strict";
import test from "node:test";
import { facultyLeaders, getDepartmentFacilities, getDepartmentMedia, resolveDepartmentCover } from "../src/lib/department-media.ts";

test("maps the supplied IT image only to Computer Science", () => {
  assert.equal(getDepartmentMedia("computer-science")?.coverImagePath, "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png");
  assert.notEqual(getDepartmentMedia("physics")?.coverImagePath, "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png");
});

test("uses supplied leadership portraits and supports legacy Earth Sciences", () => {
  assert.equal(getDepartmentMedia("biochemistry")?.headImagePath, "/images/faculty/HODBIOCHM.png");
  assert.equal(getDepartmentMedia("earth-universe-sciences-geology")?.headImagePath, "/images/faculty/HODRE.png");
  assert.equal(getDepartmentMedia("earth-sciences")?.headImagePath, "/images/faculty/HODRE.png");
});

test("keeps dashboard cover images ahead of local fallbacks", () => {
  assert.equal(resolveDepartmentCover("https://example.test/custom.png", "computer-science", "fallback.png"), "https://example.test/custom.png");
  assert.equal(resolveDepartmentCover(null, "computer-science", "fallback.png"), "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png");
  assert.equal(resolveDepartmentCover(null, "unknown", "fallback.png"), "fallback.png");
});

test("provides verified faculty leadership portraits and department facilities", () => {
  assert.equal(facultyLeaders[0]?.name, "Prof. Rémy Magloire Etoua");
  assert.equal(facultyLeaders[0]?.imagePath, "/images/faculty/RECTEUR.png");
  assert.equal(facultyLeaders[1]?.name, "Prof. Owono Owono Luc Calvin");
  assert.ok(getDepartmentFacilities("computer-science").length > 0);
  assert.ok(getDepartmentFacilities("physics").length > 0);
});
