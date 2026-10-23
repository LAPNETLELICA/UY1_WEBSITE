# Bilingual CMS Content Design

## Goal

When a visitor selects English or French, both the website interface and published CMS content appear in that language. Editors enter and maintain both versions of written content in the administration dashboard.

## Current state

The `LanguageProvider` translates known static interface strings in the browser. Supabase content is stored as single-language database columns and therefore cannot switch with the visitor's locale. The existing DOM translation mechanism must not attempt machine translation of academic content.

## Selected approach

Store non-default French content in a `translations jsonb not null default '{}'` column on each content table. Existing text columns remain the English/default content. A translation object is keyed by locale and field name, for example:

```json
{
  "fr": {
    "name": "Biochimie",
    "description": "..."
  }
}
```

This avoids schema growth from duplicated `_fr` columns, keeps current records and queries compatible, and supports future languages without another schema redesign.

## Data model

Add `translations` to public content tables that have visitor-facing text:

- `departments`, `specializations`, `programs`, `research_projects`
- `news`, `events`, `faculty_services`
- `gallery_items`, `gallery_albums`, `documents`
- `faculty_information`, `page_content_blocks`
- `site_contacts`, `site_links`, `media_assets`

Do not translate operational records such as administrators, timetable files, academic years, or technical IDs. Names, titles, descriptions, biographies, academic labels, image alt text, and JSON block copy are translatable where they are shown publicly.

## Dashboard behavior

An administrator writes the content in either English or French. On save, the dashboard calls a secured server-side translation endpoint. It detects the source language, writes the submitted version to its matching language slot, and generates the complete corresponding version in the other language. The record is saved only after the translation response succeeds, so a published update always has both language versions.

The endpoint must run as a Supabase Edge Function (or equivalent server-side route) and use a private translation-provider API key. The browser never receives the key. It translates only visitor-facing fields in the saved record; it does not translate slugs, emails, URLs, IDs, file paths, dates, telephone numbers, or configured select values.

If the provider is unavailable, save fails with a clear dashboard notice and the previous published record remains unchanged. Editors may retry after the provider is restored. This is preferable to silently publishing a one-language change.

The admin language switcher changes dashboard interface labels only. The editor shows the original field and its generated translation so an administrator can review and correct either version before publication.

## Public rendering

Introduce a `LocalizedContent` client component that receives English/default content plus the row's `translations` object. It selects `translations[locale][field]`, falling back to English if empty. It adds `data-no-translate` so the legacy static-string DOM translator does not overwrite the selected content.

Public cards, listing pages, detail pages, department pages, services, homepage sections, CMS blocks, contacts, links, and metadata use this component or shared helpers. Server-rendered content initially shows English, then changes once the saved locale is read on the client. This is consistent with the current language switcher behavior and does not require locale-specific routes.

## Compatibility and safety

- Existing content remains visible because every French value has an English fallback.
- Public read and existing RLS policies remain unchanged; `translations` is part of the existing row.
- The configured translation provider receives only the fields an administrator explicitly saves for translation. Its API key is stored only in Supabase Edge Function secrets.
- Existing slugs, URLs, IDs, dates, image paths, files, and contacts remain stable. A contact's display label may translate, while its address/email/telephone value does not.

## Verification

Tests will cover locale field selection, French fallback, JSON block translation selection, and preservation of English values during dashboard save. Manual verification will cover switching language on home, department, programme, news/event, service, and CMS block pages.
