export const formatDate = (yyyymmdd: string) => {
  if (!yyyymmdd || !/^\d{8}$/.test(yyyymmdd)) return null;
  return new Date(
    `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`,
  );
};
export const parseDateFields = (
  data: Record<string, any>,
  dateFields: string[],
) => {
  const result: Record<string, any> = { ...data };
  for (const field of dateFields) {
    if (typeof result[field] === "string" && result[field].trim() !== "") {
      const parsedDate = new Date(result[field]);
      result[field] = isNaN(parsedDate.getTime()) ? null : parsedDate;
    } else if (result[field] === "") {
      result[field] = null;
    }
  }
  return result;
};
