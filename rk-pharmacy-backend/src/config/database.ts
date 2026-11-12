import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schemas";

dotenv.config();

// Define the connection configuration type
interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// Create the connection configuration object
const dbConfig: DbConfig = {
  host: process.env.DB_HOST || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  port: parseInt(process.env.DB_PORT || "5432", 10),
};

// Create a connection pool
const pool = new Pool({
  ...dbConfig,
  max: 10, // Adjust this value based on your needs
});

// Create and export the Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Test the database connection
export async function testDatabaseConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log("Connected to the PostgreSQL database!");
    client.release();
  } catch (err) {
    console.error("Error connecting to the database:", (err as Error).message);
    throw err;
  }
}

// Export the pool for direct usage if needed
export { pool };