import type Database from "better-sqlite3";

const EARTH_RADIUS_KM = 6371;

export const registerSqlFunctions = (a_Db: Database.Database) => {
  // Great-circle distance between two lat/lon points, in km
  a_Db.function(
    "haversine_km",
    { deterministic: true },
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return EARTH_RADIUS_KM * c;
    },
  );

  // using JS's toLowerCase() which is Unicode-aware
  a_Db.function("lower_unicode", { deterministic: true }, (a_Value: unknown) => {
    return typeof a_Value === "string" ? a_Value.toLowerCase() : a_Value;
  });

  // treats umlauts as their base letter (ä->a, ö->o, ü->u, ß->ss)
  a_Db.function("german_sort_key", { deterministic: true }, (a_Value: unknown) => {
    return typeof a_Value === "string"
      ? a_Value
          .toLowerCase()
          .replace(/ä/g, "a")
          .replace(/ö/g, "o")
          .replace(/ü/g, "u")
          .replace(/ß/g, "ss")
      : a_Value;
  });
};
