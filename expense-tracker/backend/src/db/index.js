const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

function createDb(dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'expenses.db')) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  return db;
}

const db = createDb();

module.exports = { db, createDb };
