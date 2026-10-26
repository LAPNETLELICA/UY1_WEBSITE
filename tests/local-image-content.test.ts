import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { DEPARTMENT_IMAGES, PAGE_BANNER_IMAGES } from "../src/lib/content.ts";

const localImage = (value: string) => join(process.cwd(), "public", value.replace(/^\//, ""));

test("department fallback images are bundled with the site", () => {
  for (const [department, image] of Object.entries(DEPARTMENT_IMAGES)) {
    assert.match(image, /^\/images\/faculty\/.+\.png$/);
    assert.ok(existsSync(localImage(image)), `${department} image must exist: ${image}`);
  }
});

test("public page banners are bundled with the site", () => {
  for (const [page, image] of Object.entries(PAGE_BANNER_IMAGES)) {
    assert.match(image, /^\/images\/faculty\/.+\.png$/);
    assert.ok(existsSync(localImage(image)), `${page} banner must exist: ${image}`);
  }
});
