/**
 * PostgreSQL Database Connection
 *
 * Uses the 'postgres' library which is lightweight and works well with Bun.
 */

import postgres from "postgres";

// Database connection configuration
const config = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "rms",
  username: process.env.DB_USER || "rms",
  password: process.env.DB_PASSWORD || "rms_dev_password",
};

// Create connection pool
export const sql = postgres({
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
  password: config.password,
  max: 10, // Max connections in pool
  idle_timeout: 20,
  connect_timeout: 10,
});

// Health check function
export async function checkConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  await sql.end();
}
