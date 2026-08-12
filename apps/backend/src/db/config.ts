import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "@/core/config";
import { createTables } from "@/db/schema";

// better-sqlite3 does not create missing parent directories itself.
fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

export const db = new Database(env.dbPath);

// Lets reads keep working while a write (e.g. a sync) is in progress.
db.pragma("journal_mode = WAL");

createTables(db);
