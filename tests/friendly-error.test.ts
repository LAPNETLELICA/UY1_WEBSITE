import assert from "node:assert/strict";
import test from "node:test";
import { friendlyErrorMessage } from "../src/lib/friendly-error.ts";

test("hides provider quota details from administrators", () => {
  const message = friendlyErrorMessage("Individual quota reached. Please upgrade your subscription to increase your limits. Resets in 165h58m49s. (Error ID: example)");

  assert.equal(message, "This service is temporarily unavailable. Please try again later or contact the Faculty website team.");
});

test("keeps ordinary messages that are already suitable for administrators", () => {
  assert.equal(friendlyErrorMessage("The passwords do not match."), "The passwords do not match.");
});
