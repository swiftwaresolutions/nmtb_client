const normalize = (value: string): string => (value || "").toLowerCase().trim();

export const getGuardianPrefix = (guardianType: string, sex: string): string => {
  const type = normalize(guardianType);
  const patientSex = normalize(sex);

  const isMale = patientSex === "male" || patientSex === "m";
  const isFemale = patientSex === "female" || patientSex === "f";

  // Keep explicit abbreviations as-is.
  if (
    type === "s/o" ||
    type === "d/o" ||
    type === "w/o" ||
    type === "h/o" ||
    type === "g/o" ||
    type === "m/o" ||
    type === "f/o"
  ) {
    return type.toUpperCase();
  }

  // Parent guardian prefix follows patient sex.
  if (type === "father" || type === "mother" || type === "parent") {
    if (isMale) return "S/O";
    if (isFemale) return "D/O";
    return "G/O";
  }

  // Child relation prefix follows patient sex.
  if (type === "son" || type === "daughter" || type === "child") {
    if (isMale) return "F/O";
    if (isFemale) return "M/O";
    return "G/O";
  }

  if (type === "husband") return "W/O";
  if (type === "wife") return "H/O";
  if (type === "guardian") return "G/O";

  return "";
};

export const buildGuardianDisplay = (
  guardianName: string | null | undefined,
  guardianType: string | null | undefined,
  sex: string | null | undefined
): string => {
  if (!guardianName) return "";
  const prefix = getGuardianPrefix(guardianType || "", sex || "");
  return [prefix, guardianName].filter(Boolean).join(" ");
};
