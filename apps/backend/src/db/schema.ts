import type Database from "better-sqlite3";

export const createTables = (a_Db: Database.Database) => {
  a_Db.exec(`
    CREATE TABLE IF NOT EXISTS stations (
      objectid INTEGER PRIMARY KEY,
      street TEXT NOT NULL,
      raw_address TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      import_date TEXT NOT NULL,
      update_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 -- set by us, soft-delete flag
    )
  `);

  a_Db.exec(`
    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      records_fetched INTEGER NOT NULL DEFAULT 0,
      records_upserted INTEGER NOT NULL DEFAULT 0,
      records_deactivated INTEGER NOT NULL DEFAULT 0,
      error TEXT
    )
  `);
};
