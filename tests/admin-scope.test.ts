import assert from "node:assert/strict";
import test from "node:test";
import { normalizeScopedPayload } from "../src/lib/admin-scope.ts";

test("program save does not invent program_id or service_id", () => {
  const payload = { scope: "faculty", name: "Physics", department_id: "old", specialization_id: "old" };
  normalizeScopedPayload(payload, ["scope", "name", "department_id", "specialization_id"], {});
  assert.deepEqual(payload, { scope: "faculty", name: "Physics", department_id: null, specialization_id: null });
});

test("news save clears its supported program relation without inventing service_id", () => {
  const payload = { scope: "department", department_id: "department-1", specialization_id: "old", program_id: "old" };
  normalizeScopedPayload(payload, ["scope", "department_id", "specialization_id", "program_id"], {});
  assert.deepEqual(payload, { scope: "department", department_id: "department-1", specialization_id: null, program_id: null });
});

test("page block program scope derives its department and specialty", () => {
  const payload = { scope: "program", program_id: "program-1", service_id: "old" };
  normalizeScopedPayload(payload, ["scope", "department_id", "specialization_id", "program_id", "service_id"], {
    programs: [{ id: "program-1", department_id: "department-1", specialization_id: "specialty-1" }],
  });
  assert.deepEqual(payload, { scope: "program", program_id: "program-1", service_id: null, department_id: "department-1", specialization_id: "specialty-1" });
});

test("department administrator scope does not add department_id to a department record", () => {
  const payload = { name: "Physics" };
  normalizeScopedPayload(payload, ["name"], {}, "department-1");
  assert.deepEqual(payload, { name: "Physics" });
});

test("department administrator scope applies the assigned department to supported records", () => {
  const payload = { scope: "faculty", department_id: null };
  normalizeScopedPayload(payload, ["scope", "department_id"], {}, "department-1");
  assert.deepEqual(payload, { scope: "department", department_id: "department-1" });
});
