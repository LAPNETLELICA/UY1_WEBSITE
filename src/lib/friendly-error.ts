const serviceLimitPattern = /\b(quota|subscription|rate limit|too many requests|error id)\b/i;

export function friendlyErrorMessage(message: unknown) {
  const text = typeof message === "string" ? message.trim() : "";
  if (!text || serviceLimitPattern.test(text)) {
    return "This service is temporarily unavailable. Please try again later or contact the Faculty website team.";
  }
  return text;
}
