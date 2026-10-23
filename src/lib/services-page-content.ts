export type ServiceLeader = { role: string; name: string; summary: string; imagePath: string };
export type ServicesPageContent = {
  homeEyebrow: string;
  homeHeading: string;
  homeIntroduction: string;
  pageHeading: string;
  pageIntroduction: string;
  sectionHeading: string;
  sectionDescription: string;
  bannerImage: string;
  leaders: ServiceLeader[];
};

const defaultCopy = {
  homeEyebrow: "Leadership · Administration · Student support",
  homeHeading: "Faculty services and administration.",
  homeIntroduction: "Meet the offices and people who support the academic and administrative life of the Faculty.",
  pageHeading: "Faculty services",
  pageIntroduction: "Meet the people and offices supporting academic leadership, administration and student services across the Faculty.",
  sectionHeading: "People and services behind the Faculty",
  sectionDescription: "This directory presents published faculty offices, responsible people and departmental leadership. Contact details and roles can be maintained by authorized staff in the administration dashboard.",
};

const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

const filledText = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value : fallback;

export function resolveServicesPageContent(raw: unknown, fallbackBanner: string, fallbackLeaders: ServiceLeader[]): ServicesPageContent {
  const record = objectValue(raw);
  const leaders = Array.isArray(record.leaders) && record.leaders.every(item => {
    const leader = objectValue(item);
    return typeof leader.role === "string" && typeof leader.name === "string"
      && typeof leader.summary === "string" && typeof leader.imagePath === "string";
  }) ? record.leaders as ServiceLeader[] : fallbackLeaders;
  return {
    homeEyebrow: filledText(record.homeEyebrow, defaultCopy.homeEyebrow),
    homeHeading: filledText(record.homeHeading, defaultCopy.homeHeading),
    homeIntroduction: filledText(record.homeIntroduction, defaultCopy.homeIntroduction),
    pageHeading: filledText(record.pageHeading, defaultCopy.pageHeading),
    pageIntroduction: filledText(record.pageIntroduction, defaultCopy.pageIntroduction),
    sectionHeading: filledText(record.sectionHeading, defaultCopy.sectionHeading),
    sectionDescription: filledText(record.sectionDescription, defaultCopy.sectionDescription),
    bannerImage: filledText(record.bannerImage, fallbackBanner),
    leaders: leaders.map(leader => ({ ...leader })),
  };
}

export function resolvePublicServicesPageContent(row: { is_public: boolean; content: unknown } | null, fallbackBanner: string, fallbackLeaders: ServiceLeader[]): ServicesPageContent {
  return resolveServicesPageContent(row?.is_public ? row.content : null, fallbackBanner, fallbackLeaders);
}

export function mergeServicesPageContent(previous: unknown, next: ServicesPageContent): Record<string, unknown> {
  return { ...objectValue(previous), ...next };
}

export function validateServicesPageContent(value: ServicesPageContent): string | null {
  if (!value.homeHeading.trim() || !value.pageHeading.trim() || !value.sectionHeading.trim()) return "Complete every page heading before saving.";
  for (const leader of value.leaders) {
    if (!leader.role.trim()) return "Each leader needs a role.";
    if (!leader.name.trim()) return "Each leader needs a name.";
  }
  return null;
}
