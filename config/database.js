const { Pool: PgPool } = require('pg');
const mysql = require('mysql2/promise');

const getDbType = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('mysql://')) return 'mysql';
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) return 'postgres';
  if (process.env.DB_TYPE === 'sqlite' || /\.db$/i.test(dbUrl)) return 'sqlite';
  return process.env.DB_TYPE || 'postgres';
};

const dbType = getDbType();

const createPgPool = () => {
  return new PgPool({
    connectionString: process.env.DATABASE_URL || undefined,
    user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
    port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
    ssl: process.env.DATABASE_URL || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

const createMysqlPool = () => {
  return mysql.createPool({
    uri: process.env.DATABASE_URL,
    user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
    port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
};

const createSqlitePool = () => {
  const Database = require('better-sqlite3');
  let dbPath = process.env.DATABASE_URL || process.env.SQLITE_DB_PATH || './data/products.db';
  if (dbPath.startsWith('sqlite:')) {
    dbPath = dbPath.replace('sqlite:', '');
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
};

const convertPlaceholders = (text) => {
  return text.replace(/\$(\d+)/g, '?');
};

const convertOnConflict = (text) => {
  const conflictMatch = text.match(/ON CONFLICT \((\w+)\)\s+DO UPDATE SET\s+(.+)/i);
  if (conflictMatch) {
    const [, column, updates] = conflictMatch;
    const cleanText = text.replace(/ON CONFLICT \(\w+\)\s+DO UPDATE SET[\s\S]+$/i, '');
    return `${cleanText} ON DUPLICATE KEY UPDATE ${updates}`;
  }
  return text.replace(/ON CONFLICT DO NOTHING/gi, '');
};

const convertIlikeToLike = (text) => {
  return text.replace(/\bILIKE\b/gi, 'LIKE');
};

const convertToPostgres = (text) => {
  let result = text;
  result = result.replace(/ON DUPLICATE KEY UPDATE[\s\S]+?(?=(?:INSERT|UPDATE|DELETE|SELECT|$))/gi, '');
  return result;
};

let pool;
let query;

if (dbType === 'mysql') {
  pool = createMysqlPool();
  console.log('📦 Database: MySQL');

  query = async (text, params) => {
    let mysqlText = convertPlaceholders(text);
    mysqlText = convertOnConflict(mysqlText);
    const [rows] = await pool.execute(mysqlText, params);
    return { rows };
  };

  pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
  });
} else if (dbType === 'sqlite') {
  pool = createSqlitePool();
  console.log('📦 Database: SQLite');

  const sqliteQuery = (text, params) => {
    return new Promise((resolve, reject) => {
      try {
        let sqliteText = convertPlaceholders(text);
        sqliteText = convertOnConflict(sqliteText);
        sqliteText = convertToPostgres(sqliteText);
        sqliteText = convertIlikeToLike(sqliteText);

        const stmt = pool.prepare(sqliteText);
        const rows = stmt.all(params || []);
        resolve({ rows });
      } catch (error) {
        reject(error);
      }
    });
  };

  const sqliteRun = (text, params) => {
    return new Promise((resolve, reject) => {
      try {
        let sqliteText = convertPlaceholders(text);
        sqliteText = convertOnConflict(sqliteText);
        sqliteText = convertToPostgres(sqliteText);
        sqliteText = convertIlikeToLike(sqliteText);

        const stmt = pool.prepare(sqliteText);
        const result = stmt.run(params || []);
        resolve({ rows: [], lastInsertRowid: result.lastInsertRowid, changes: result.changes });
      } catch (error) {
        reject(error);
      }
    });
  };

  query = sqliteQuery;
  query.run = sqliteRun;
} else {
  pool = createPgPool();
  console.log('📦 Database: PostgreSQL');

  query = (text, params) => pool.query(text, params);

  pool.on('connect', () => {
    console.log('✅ Database connected successfully');
  });

  pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
  });
}

module.exports = {
  query,
  pool,
  dbType,
  isMySQL: dbType === 'mysql',
  isPostgres: dbType === 'postgres',
  isSqlite: dbType === 'sqlite',
};