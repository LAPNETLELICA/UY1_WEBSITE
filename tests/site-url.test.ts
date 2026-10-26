import assert from "node:assert/strict";
import test from "node:test";
import { configuredSiteOrigin, invitationSiteOrigin } from "../src/lib/site-url.ts";

test("server-only SITE_URL takes priority for invitation redirects", () => {
  assert.equal(
    invitationSiteOrigin({ NODE_ENV: "production", SITE_URL: "https://sciences.example.edu/", RAILWAY_PUBLIC_DOMAIN: "preview.up.railway.app" }),
    "https://sciences.example.edu",
  );
});

test("Railway public domains become HTTPS origins", () => {
  assert.equal(configuredSiteOrigin({ RAILWAY_PUBLIC_DOMAIN: "uy1-production.up.railway.app" }), "https://uy1-production.up.railway.app");
});

test("production never derives an invitation redirect from an incoming host", () => {
  assert.equal(invitationSiteOrigin({ NODE_ENV: "production" }, "https://untrusted.example"), null);
});

test("local development can use the request origin when no site URL is configured", () => {
  assert.equal(invitationSiteOrigin({ NODE_ENV: "development" }, "http://localhost:3000"), "http://localhost:3000");
});

test("configured site URLs reject credentials and non-web protocols", () => {
  assert.throws(() => configuredSiteOrigin({ SITE_URL: "https://user:password@example.edu" }), /credentials/);
  assert.throws(() => configuredSiteOrigin({ SITE_URL: "mailto:admin@example.edu" }), /HTTP/);
});
