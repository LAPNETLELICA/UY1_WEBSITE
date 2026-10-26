type Environment = Record<string, string | undefined>;

function toOrigin(value: string, name: string): string {
  const candidate = value.trim();
  if (!candidate) throw new Error(`${name} cannot be empty.`);

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(candidate) ? candidate : `https://${candidate}`);
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) URL or domain.`);
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname) {
    throw new Error(`${name} must be a public HTTP(S) origin without credentials.`);
  }

  return url.origin;
}

/**
 * Returns the configured public origin without trusting request headers. `SITE_URL`
 * is server-only and takes precedence; Railway supplies `RAILWAY_PUBLIC_DOMAIN`
 * after a public domain has been attached to the service.
 */
export function configuredSiteOrigin(environment: Environment = process.env): string | null {
  const configured = [
    ["SITE_URL", environment.SITE_URL],
    ["NEXT_PUBLIC_SITE_URL", environment.NEXT_PUBLIC_SITE_URL],
    ["RAILWAY_PUBLIC_DOMAIN", environment.RAILWAY_PUBLIC_DOMAIN],
  ] as const;

  for (const [name, value] of configured) {
    if (value?.trim()) return toOrigin(value, name);
  }
  return null;
}

/**
 * Production invitation redirects must use an explicitly configured public
 * origin. The request origin remains a local-development convenience only.
 */
export function invitationSiteOrigin(environment: Environment = process.env, requestOrigin?: string): string | null {
  const configured = configuredSiteOrigin(environment);
  if (configured) return configured;
  if (environment.NODE_ENV === "production" || !requestOrigin) return null;
  return toOrigin(requestOrigin, "request origin");
}

export function invitationConfigurationMessage() {
  return "Set SITE_URL (preferred), NEXT_PUBLIC_SITE_URL, or RAILWAY_PUBLIC_DOMAIN to the public site origin before sending invitations.";
}
