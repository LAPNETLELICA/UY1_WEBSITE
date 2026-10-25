import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowServicesEditor } from "../src/lib/admin-services-visibility.ts";

test("faculty administrators see the Services editor only after opening its screen", () => {
  assert.equal(shouldShowServicesEditor("overview", true), false);
  assert.equal(shouldShowServicesEditor("services", true), true);
  assert.equal(shouldShowServicesEditor("departments", true), false);
});

test("department-only administrators never see the faculty-wide Services editor", () => {
  assert.equal(shouldShowServicesEditor("overview", false), false);
  assert.equal(shouldShowServicesEditor("services", false), false);
});
