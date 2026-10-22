const portalPrefix = "/admin-uy1-";

export function departmentPortalPath(departmentSlug: string) {
  return `${portalPrefix}${departmentSlug}`;
}

export function safeDepartmentPortalPath(value: string | null) {
  if (!value || !value.startsWith(portalPrefix)) return null;
  const slug = value.slice(portalPrefix.length);
  return /^[a-z0-9-]+$/.test(slug) ? value : null;
}
