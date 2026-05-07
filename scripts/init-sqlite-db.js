const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/products.db');
const sqlPath = path.join(__dirname, '../database/products_simple_schema.sql');

try {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  }

  const db = new Database(dbPath);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  db.exec(sql);
  db.close();

  console.log('SQLite database initialized successfully at ./data/products.db');
} catch (error) {
  console.error('Error initializing SQLite database:', error.message);
  process.exit(1);
}
