export type Locale = "en" | "fr";
export type TranslationMap = Partial<Record<Locale, Record<string, unknown>>>;

type LocalizedRow = Record<string, unknown> & { translations?: TranslationMap | null };

export function getLocalizedField(row: LocalizedRow, field: string, locale: Locale): string {
  const translated = row.translations?.[locale]?.[field];
  if (typeof translated === "string" && translated.trim()) return translated;
  const original = row[field];
  return typeof original === "string" ? original : "";
}

export function getLocalizedObject<T>(value: T, locale: Locale, translation?: unknown): T {
  if (locale === "fr" && translation !== undefined && translation !== null) return translation as T;
  return value;
}

export function getTranslationFields(row: LocalizedRow, fields: readonly string[], locale: Locale): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, getLocalizedField(row, field, locale)]));
}
