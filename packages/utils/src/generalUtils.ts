export const formatTimestamp = (a_Date?: Date): string => {
  return (a_Date ?? new Date()).toISOString();
};

export const formatLocalDateTime = (a_Value: string | Date): string => {
  const date = typeof a_Value === "string" ? new Date(a_Value) : a_Value;
  return date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
};

export const deepSortObject = <T>(a_Object: T): T => {
  if (Array.isArray(a_Object)) {
    const mapped = a_Object.map(deepSortObject);

    // Only sort arrays of primitives (safe case)
    const isPrimitiveArray = mapped.every(
      (v) =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        v === null,
    );

    if (isPrimitiveArray) {
      return mapped.sort((a, b) => String(a).localeCompare(String(b))) as T;
    }

    // Keep order for arrays of objects / arrays (e.g. coordinates)
    return mapped as T;
  }

  if (a_Object && typeof a_Object === "object") {
    return Object.keys(a_Object as Record<string, any>)
      .sort()
      .reduce((acc, key) => {
        const value = (a_Object as any)[key];
        if (value !== undefined) {
          (acc as any)[key] = deepSortObject(value);
        }
        return acc;
      }, {} as any) as T;
  }

  return a_Object;
};

export const shortenText = (a_Text: string, a_Limit: number) => {
  return a_Text.length > a_Limit ? `${a_Text.slice(0, a_Limit)}...` : a_Text;
};