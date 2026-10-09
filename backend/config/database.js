/**
 * MySQL Connection Pool Configuration
 * Utilizes mysql2 Promise API with connection pooling and graceful error handling.
 */
import dotenv from 'dotenv';
dotenv.config();

let pool = null;

export async function getDbPool() {
  if (pool) return pool;

  try {
    const mysql = await import('mysql2/promise');
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventory_management',
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      decimalNumbers: true,
      timezone: 'Z',
    });
    return pool;
  } catch (err) {
    console.warn('MySQL pool initialization notice: Running in decoupled client/server mode.', err?.message);
    return null;
  }
}

export default { getDbPool };
