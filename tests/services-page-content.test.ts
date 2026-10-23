import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeServicesPageContent,
  resolvePublicServicesPageContent,
  resolveServicesPageContent,
  validateServicesPageContent,
} from "../src/lib/services-page-content.ts";

const banner = "https://example.test/services.jpg";
const leaders = [{ role: "Dean", name: "Existing Dean", summary: "Leads the Faculty.", imagePath: "/dean.png" }];

test("missing and malformed content retain the current Services copy and images", () => {
  const fallback = resolveServicesPageContent(null, banner, leaders);
  assert.equal(fallback.homeHeading, "Faculty services and administration.");
  assert.equal(fallback.pageHeading, "Faculty services");
  assert.equal(fallback.sectionHeading, "People and services behind the Faculty");
  assert.equal(fallback.bannerImage, banner);
  assert.deepEqual(fallback.leaders, leaders);
  assert.equal(resolveServicesPageContent(["invalid"], banner, leaders).homeHeading, fallback.homeHeading);
  assert.equal(resolveServicesPageContent({ homeHeading: "Custom", pageHeading: "", leaders: "bad" }, banner, leaders).pageHeading, fallback.pageHeading);
});

test("configured leaders keep their order and an explicit empty list hides fallback cards", () => {
  const ordered = [
    { role: "Dean", name: "B", summary: "Second", imagePath: "/b.png" },
    { role: "Rector", name: "A", summary: "First", imagePath: "/a.png" },
  ];
  assert.deepEqual(resolveServicesPageContent({ leaders: ordered }, banner, leaders).leaders, ordered);
  assert.deepEqual(resolveServicesPageContent({ leaders: [] }, banner, leaders).leaders, []);
});

test("saving Services copy preserves unrelated content properties", () => {
  const next = resolveServicesPageContent({ homeHeading: "New heading" }, banner, leaders);
  assert.deepEqual(mergeServicesPageContent({ other: { keep: true }, homeHeading: "Old" }, next), { other: { keep: true }, ...next });
});

test("required headings and leader names and roles are validated", () => {
  const valid = resolveServicesPageContent(null, banner, leaders);
  assert.equal(validateServicesPageContent(valid), null);
  assert.match(validateServicesPageContent({ ...valid, homeHeading: " " }) ?? "", /heading/i);
  assert.match(validateServicesPageContent({ ...valid, leaders: [{ ...leaders[0], name: "" }] }) ?? "", /name/i);
  assert.match(validateServicesPageContent({ ...valid, leaders: [{ ...leaders[0], role: "" }] }) ?? "", /role/i);
});

test("non-public Services settings cannot replace public fallback copy", () => {
  const hidden = resolvePublicServicesPageContent({ is_public: false, content: { homeHeading: "Private" } }, banner, leaders);
  assert.equal(hidden.homeHeading, "Faculty services and administration.");
  const publicValue = resolvePublicServicesPageContent({ is_public: true, content: { homeHeading: "Published" } }, banner, leaders);
  assert.equal(publicValue.homeHeading, "Published");
});
