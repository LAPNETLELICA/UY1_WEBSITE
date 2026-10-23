import assert from "node:assert/strict";
import test from "node:test";
import { readFacultyInformationText, withFacultyInformationText } from "../src/lib/faculty-information-content.ts";

test("reads legacy About text and preserves other content on edit", () => {
  assert.equal(readFacultyInformationText({ body: "Old mission", icon: "science" }), "Old mission");
  assert.deepEqual(withFacultyInformationText({ body: "Old mission", icon: "science" }, "New mission"), { body: "Old mission", icon: "science", text: "New mission" });
});
