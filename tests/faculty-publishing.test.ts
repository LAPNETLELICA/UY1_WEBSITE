import assert from "node:assert/strict";
import test from "node:test";
import { buildPublishingPayload, getPublishingDestination } from "../src/lib/faculty-publishing.ts";

test("publishing an announcement keeps its PDF and useful links", () => {
  const result = buildPublishingPayload({
    type: "general_announcement", title: "Exams", description: "New schedule", status: "published",
    imagePath: "", imagePaths: [], resourceLinks: [
      { label: "  Schedule  ", url: "https://example.edu/schedule.pdf", kind: "pdf" },
      { label: "Portal", url: "https://example.edu/portal", kind: "link" },
    ],
  });
  assert.deepEqual(result.payload.resource_links, [
    { label: "Schedule", url: "https://example.edu/schedule.pdf", kind: "pdf" },
    { label: "Portal", url: "https://example.edu/portal", kind: "link" },
  ]);
});

test("routes each content type to the page that reads its saved table", () => {
  assert.deepEqual(getPublishingDestination("academic_information"), { table: "news", category: "Academic", listingHref: "/news-events/academic-news" });
  assert.deepEqual(getPublishingDestination("general_announcement"), { table: "news", category: "General", listingHref: "/news-events/general-news" });
  assert.deepEqual(getPublishingDestination("event"), { table: "events", category: "General", listingHref: "/news-events/general-events" });
  assert.deepEqual(getPublishingDestination("research"), { table: "research_projects", listingHref: "/research" });
});

test("saves plain text for both listing and detail views with empty image arrays", () => {
  const result = buildPublishingPayload({ type: "academic_information", title: "New semester", description: "Registration opens Monday.", status: "published", imagePath: "", imagePaths: [] });
  assert.equal(result.table, "news");
  assert.equal(result.payload.excerpt, "Registration opens Monday.");
  assert.equal(result.payload.body, "Registration opens Monday.");
  assert.deepEqual(result.payload.image_paths, []);
  assert.equal(result.payload.category, "Academic");
});

test("requires an event date before saving", () => {
  assert.throws(() => buildPublishingPayload({ type: "event", title: "Talk", description: "A talk", status: "draft", imagePath: "", imagePaths: [] }), /start date/i);
});

test("editing preserves the public slug", () => {
  const result = buildPublishingPayload({ type: "research", title: "New title", description: "A study", status: "published", imagePath: "https://example.test/cover.png", imagePaths: ["https://example.test/extra.png"] }, { slug: "old-title" });
  assert.equal(result.payload.slug, "old-title");
  assert.equal(result.payload.summary, "A study");
  assert.equal(result.payload.details, "A study");
  assert.deepEqual(result.payload.image_paths, ["https://example.test/extra.png"]);
});
