const mysql = require('mysql2/promise');

let pool;

/**
 * Creates (once) and returns a MySQL connection pool.
 *
 * IMPORTANT FOR STUDENTS:
 * These values MUST come from environment variables that you will define
 * in your docker-compose.yml file for the "app" service. Do NOT hardcode
 * database credentials here.
 *
 * Required environment variables:
 *   DB_HOST     - the hostname of the MySQL service (this should be the
 *                 SERVICE NAME of your mysql container inside the
 *                 docker-compose network, NOT "localhost")
 *   DB_PORT     - MySQL port (default 3306)
 *   DB_USER     - MySQL user
 *   DB_PASSWORD - MySQL password
 *   DB_NAME     - MySQL database name
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

async function testConnection() {
  const p = getPool();
  const conn = await p.getConnection();
  await conn.ping();
  conn.release();
}

module.exports = { getPool, testConnection };
