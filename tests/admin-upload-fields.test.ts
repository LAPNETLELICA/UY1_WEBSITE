import assert from "node:assert/strict";
import test from "node:test";
import { getAdminUploadKind } from "../src/lib/admin-upload-fields.ts";

test("academic and general news/event image fields use upload controls", () => {
  for (const moduleKey of ["academic_news", "academic_events", "general_news", "general_events"]) {
    assert.equal(getAdminUploadKind(moduleKey, "image_path"), "image");
    assert.equal(getAdminUploadKind(moduleKey, "image_paths"), "image");
  }
});

test("existing media upload controls remain available", () => {
  assert.equal(getAdminUploadKind("programs", "image_path"), "image");
  assert.equal(getAdminUploadKind("media", "public_url"), "image");
  assert.equal(getAdminUploadKind("documents", "storage_path"), "document");
  assert.equal(getAdminUploadKind("timetables", "storage_path"), "document");
  assert.equal(getAdminUploadKind("media", "storage_path"), null);
  assert.equal(getAdminUploadKind("academic_news", "external_url"), null);
});
