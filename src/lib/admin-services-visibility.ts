export function shouldShowServicesEditor(active: string, isFacultyAdmin: boolean): boolean {
  return isFacultyAdmin && (active === "overview" || active === "services");
}
