export function validateServicesImage(file: { type: string; size: number }): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > 20 * 1024 * 1024) return "Images must be 20 MB or smaller.";
  return null;
}
