"use client";

type CmsRow = Record<string, unknown> & {
  translations?: { fr?: Record<string, unknown> } | null;
};

function collectTranslationPairs(rows: CmsRow | CmsRow[] | null | undefined) {
  const map: Record<string, string> = {};
  const collect = (source: unknown, translated: unknown) => {
    if (typeof source === "string" && typeof translated === "string") {
      if (source.trim() && translated.trim()) map[source] = translated;
      return;
    }
    if (Array.isArray(source) && Array.isArray(translated)) {
      source.forEach((value, index) => collect(value, translated[index]));
      return;
    }
    if (source && translated && typeof source === "object" && typeof translated === "object") {
      Object.entries(source).forEach(([key, value]) => collect(value, (translated as Record<string, unknown>)[key]));
    }
  };
  for (const row of Array.isArray(rows) ? rows : rows ? [rows] : []) {
    const french = row.translations?.fr;
    if (!french || typeof french !== "object") continue;
    for (const [field, value] of Object.entries(french)) {
      const source = row[field];
      collect(source, value);
    }
  }
  return map;
}

/** Makes translations stored on server-fetched CMS records available to the client language switcher. */
export function CmsTranslationMap({ rows }: { rows: CmsRow | CmsRow[] | null | undefined }) {
  const translations = collectTranslationPairs(rows);
  if (!Object.keys(translations).length) return null;
  return <span hidden aria-hidden="true" data-no-translate data-i18n-map={JSON.stringify(translations)} />;
}
