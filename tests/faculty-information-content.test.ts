import assert from "node:assert/strict";
import test from "node:test";
import { getAboutBannerImage, getAboutText, readFacultyInformationText, withFacultyInformationText } from "../src/lib/faculty-information-content.ts";

test("reads legacy About text and preserves other content on edit", () => {
  assert.equal(readFacultyInformationText({ body: "Old mission", icon: "science" }), "Old mission");
  assert.deepEqual(withFacultyInformationText({ body: "Old mission", icon: "science" }, "New mission"), { body: "Old mission", icon: "science", text: "New mission" });
});

test("uses a saved public About banner image and falls back when none is saved", () => {
  const fallback = "https://example.test/default.jpg";
  assert.equal(getAboutBannerImage([{ key: "about_banner", content: { image_path: "https://example.test/new.jpg" } }], fallback), "https://example.test/new.jpg");
  assert.equal(getAboutBannerImage([{ key: "about_banner", content: {} }], fallback), fallback);
  assert.equal(getAboutBannerImage([], fallback), fallback);
});

test("uses saved About copy for a section and retains default copy otherwise", () => {
  const rows = [{ key: "hero_title", content: { text: "Our Faculty" } }];
  assert.equal(getAboutText(rows, "hero_title", "Science in service of society."), "Our Faculty");
  assert.equal(getAboutText(rows, "mission", "Our mission"), "Our mission");
});
