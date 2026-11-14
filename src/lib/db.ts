import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Development database: swap for a hosted database before deploying.
const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "vakilat.db");
const LEGACY_USERS = path.join(DIR, "users.json");

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    state TEXT NOT NULL,
    profession TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'Legal professional',
    photo TEXT,
    invite_code TEXT,
    password_hash TEXT NOT NULL,
    password_updated_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    tag TEXT,
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS notes_user ON notes(user_id, updated_at);

  CREATE TABLE IF NOT EXISTS saved_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    ref_key TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    href TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (user_id, kind, ref_key)
  );

  CREATE TABLE IF NOT EXISTS hearings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_title TEXT NOT NULL,
    case_number TEXT,
    court TEXT NOT NULL,
    purpose TEXT,
    hearing_date TEXT NOT NULL,
    hearing_time TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS hearings_user ON hearings(user_id, hearing_date);

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL,
    title TEXT NOT NULL,
    messages TEXT NOT NULL,
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS chats_user ON chats(user_id, tool, updated_at);

  CREATE TABLE IF NOT EXISTS answer_ratings (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, message_id)
  );

  CREATE TABLE IF NOT EXISTS vidhi_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    practice TEXT NOT NULL DEFAULT '',
    jurisdiction TEXT NOT NULL DEFAULT '',
    preferences TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template TEXT NOT NULL,
    title TEXT NOT NULL,
    fields TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS drafts_user ON drafts(user_id, updated_at);

  CREATE TABLE IF NOT EXISTS moot_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setup TEXT NOT NULL,
    messages TEXT NOT NULL,
    feedback TEXT,
    closed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS moot_user ON moot_sessions(user_id, updated_at);

  CREATE TABLE IF NOT EXISTS ai_usage (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    deep INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
  );

  CREATE TABLE IF NOT EXISTS ai_spend (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    task TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    cached_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost_micros INTEGER NOT NULL DEFAULT 0,
    priced INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS ai_spend_user_day ON ai_spend(user_id, day);

  CREATE TABLE IF NOT EXISTS password_codes (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_lang TEXT NOT NULL DEFAULT 'auto',
    target_lang TEXT NOT NULL,
    source_text TEXT NOT NULL,
    result_text TEXT NOT NULL,
    source_name TEXT,
    rating INTEGER,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS translations_user ON translations(user_id, created_at);

  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS folders_user ON folders(user_id, kind);

  CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_tours (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_key TEXT NOT NULL,
    dismissed_at TEXT NOT NULL,
    PRIMARY KEY (user_id, tour_key)
  );
`;

/** Columns added after a table was first created; CREATE TABLE IF NOT EXISTS won't add them. */
const addedColumns: [table: string, column: string, definition: string, backfill?: string][] = [
  ["moot_sessions", "closed", "INTEGER NOT NULL DEFAULT 0", "UPDATE moot_sessions SET closed = 1 WHERE feedback IS NOT NULL"],
  ["chats", "pinned", "INTEGER NOT NULL DEFAULT 0"],
  ["ai_usage", "deep", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "photo", "TEXT"],
  ["users", "account_type", "TEXT NOT NULL DEFAULT 'Legal professional'"],
  ["users", "password_updated_at", "TEXT"],
  ["hearings", "event_type", "TEXT NOT NULL DEFAULT 'hearing'"],
  ["hearings", "remind_at", "TEXT"],
  ["notes", "folder_id", "TEXT"],
  ["saved_items", "folder_id", "TEXT"],
  ["drafts", "messages", "TEXT NOT NULL DEFAULT '[]'"],
  ["drafts", "language", "TEXT NOT NULL DEFAULT 'English'"],
];

function migrate(db: DatabaseSync) {
  db.exec(schema);
  for (const [table, column, definition, backfill] of addedColumns) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (columns.some((c) => c.name === column)) continue;
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    if (backfill) db.exec(backfill);
  }
  globalForDb.vakilatSchema = schema;
}

function importLegacyUsers(db: DatabaseSync) {
  if (!existsSync(LEGACY_USERS)) return;
  const users = JSON.parse(readFileSync(LEGACY_USERS, "utf8")) as Array<Record<string, string>>;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO users (id, name, email, phone, state, profession, invite_code, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const u of users) {
    insert.run(u.id, u.name, u.email, u.phone, u.state, u.profession, u.inviteCode ?? null, u.passwordHash, u.createdAt);
  }
  renameSync(LEGACY_USERS, `${LEGACY_USERS}.imported`);
}

function open() {
  mkdirSync(DIR, { recursive: true });
  const db = new DatabaseSync(FILE);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  migrate(db);
  importLegacyUsers(db);
  return db;
}

const globalForDb = globalThis as unknown as { vakilatDb?: DatabaseSync; vakilatSchema?: string };

export function getDb() {
  globalForDb.vakilatDb ??= open();
  if (globalForDb.vakilatSchema !== schema) migrate(globalForDb.vakilatDb);
  return globalForDb.vakilatDb;
}
