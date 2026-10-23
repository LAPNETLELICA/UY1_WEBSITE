import test from "node:test";
import assert from "node:assert/strict";
import { readPageBlockDescription, withPageBlockDescription } from "../src/lib/page-block-description.ts";

test("reads current and legacy prose fields", () => {
  assert.equal(readPageBlockDescription({ description: "Current", body: "Old" }), "Current");
  assert.equal(readPageBlockDescription({ body: "Legacy body" }), "Legacy body");
  assert.equal(readPageBlockDescription({ text: "Legacy text" }), "Legacy text");
  assert.equal(readPageBlockDescription(null), "");
  assert.equal(readPageBlockDescription(["array"]), "");
  assert.equal(readPageBlockDescription("text"), "");
});

test("updates description without losing rich content", () => {
  const previous = { body: "Old", items: [{ title: "Card" }], stats: [{ value: "10" }], eyebrow: "About", image_alt: "Campus" };
  assert.deepEqual(withPageBlockDescription(previous, "New copy"), { ...previous, description: "New copy" });
  assert.deepEqual(withPageBlockDescription(previous, ""), { ...previous, description: "" });
  assert.deepEqual(withPageBlockDescription(null, "New"), { description: "New" });
});
