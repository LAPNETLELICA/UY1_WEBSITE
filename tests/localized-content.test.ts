import assert from "node:assert/strict";
import test from "node:test";
import { getLocalizedField, getLocalizedObject } from "../src/lib/localized-content";

test("selects a French field when it is present", () => {
  assert.equal(getLocalizedField({ title: "Science", translations: { fr: { title: "Sciences" } } }, "title", "fr"), "Sciences");
});

test("falls back to the default field when French content is missing", () => {
  assert.equal(getLocalizedField({ title: "Science", translations: {} }, "title", "fr"), "Science");
});

test("preserves non-text values in localized JSON content", () => {
  assert.deepEqual(
    getLocalizedObject({ heading: "Science", stats: [{ value: 10, label: "Departments" }] }, "fr", { heading: "Sciences", stats: [{ value: 10, label: "Départements" }] }),
    { heading: "Sciences", stats: [{ value: 10, label: "Départements" }] },
  );
});
