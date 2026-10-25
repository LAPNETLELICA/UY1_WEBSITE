import test from "node:test";
import assert from "node:assert/strict";
import { normalizeContentResources } from "../src/lib/content-resources.ts";

test("normalizes labeled PDF and website resources", () => {
  assert.deepEqual(normalizeContentResources([
    { label: "  Exam timetable  ", url: " https://example.edu/exams.pdf ", kind: "pdf" },
    { label: "Registration", url: "https://example.edu/register", kind: "link" },
  ]), [
    { label: "Exam timetable", url: "https://example.edu/exams.pdf", kind: "pdf" },
    { label: "Registration", url: "https://example.edu/register", kind: "link" },
  ]);
});

test("rejects unsafe or incomplete resources", () => {
  assert.throws(() => normalizeContentResources([{ label: "Bad", url: "javascript:alert(1)", kind: "link" }]), /HTTP/);
  assert.throws(() => normalizeContentResources([{ label: "", url: "https://example.edu", kind: "link" }]), /label/);
  assert.throws(() => normalizeContentResources([{ label: "Timetable", url: "https://example.edu/file.png", kind: "pdf" }]), /PDF/);
});
