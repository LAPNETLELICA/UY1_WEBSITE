import assert from "node:assert/strict";
import test from "node:test";
import { validateServicesImage } from "../src/lib/services-image-upload.ts";

test("Services images accept JPEG, PNG and WebP at the 20 MB boundary", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(validateServicesImage({ type, size: 20 * 1024 * 1024 }), null);
  }
});

test("Services images reject PDFs, unknown images and files over 20 MB", () => {
  assert.match(validateServicesImage({ type: "application/pdf", size: 1024 }) ?? "", /JPEG|PNG|WebP/);
  assert.match(validateServicesImage({ type: "image/gif", size: 1024 }) ?? "", /JPEG|PNG|WebP/);
  assert.match(validateServicesImage({ type: "image/png", size: 20 * 1024 * 1024 + 1 }) ?? "", /20 MB/);
});
