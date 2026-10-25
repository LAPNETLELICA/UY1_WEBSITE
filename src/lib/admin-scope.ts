type RelatedRecord = { id: string; department_id?: string | null; specialization_id?: string | null };
type ScopeRelations = { specializations?: RelatedRecord[]; programs?: RelatedRecord[]; faculty_services?: RelatedRecord[] };

export function normalizeScopedPayload(
  payload: Record<string, any>,
  fieldNames: readonly string[],
  relations: ScopeRelations,
  managedDepartmentId?: string | null,
): void {
  const fields = new Set(fieldNames);
  const setIfSupported = (field: string, value: string | null) => {
    if (fields.has(field)) payload[field] = value;
  };

  if (payload.scope === "faculty") {
    setIfSupported("department_id", null);
    setIfSupported("specialization_id", null);
    setIfSupported("program_id", null);
    setIfSupported("service_id", null);
  } else if (payload.scope === "department") {
    setIfSupported("specialization_id", null);
    setIfSupported("program_id", null);
    setIfSupported("service_id", null);
  } else if (payload.scope === "specialty") {
    setIfSupported("program_id", null);
    setIfSupported("service_id", null);
    if (payload.specialization_id && !payload.department_id) {
      setIfSupported("department_id", relations.specializations?.find(item => item.id === payload.specialization_id)?.department_id ?? null);
    }
  } else if (payload.scope === "program" && payload.program_id) {
    setIfSupported("service_id", null);
    const selected = relations.programs?.find(item => item.id === payload.program_id);
    setIfSupported("department_id", selected?.department_id ?? null);
    setIfSupported("specialization_id", selected?.specialization_id ?? null);
  } else if (payload.scope === "service" && payload.service_id) {
    setIfSupported("program_id", null);
    const selected = relations.faculty_services?.find(item => item.id === payload.service_id);
    setIfSupported("department_id", selected?.department_id ?? null);
    setIfSupported("specialization_id", null);
  }

  if (managedDepartmentId && fields.has("department_id")) {
    payload.department_id = managedDepartmentId;
    if (payload.scope === "faculty") payload.scope = "department";
  }
}
