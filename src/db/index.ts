/**
 * Connect to PostgreSQL Database (Supabase/Neon/Local PostgreSQL)
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 */
import { loadEnvConfig } from '@next/env';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Ensure environment variables are loaded from .env.local
loadEnvConfig(process.cwd());

let db: ReturnType<typeof drizzle> | null = null;

// https://opennext.js.org/cloudflare/howtos/db#postgresql
export async function getDb() {
  if (db) return db;
  
  let connectionString: string | undefined;
  let isHyperdrive = false;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, prefer DATABASE_URL to avoid Hyperdrive simulation overhead
  if (isDevelopment && process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL;
    console.log('[DB] Development mode: using DATABASE_URL directly');
  } else {
    // In production or if DATABASE_URL is not set, try Hyperdrive
    try {
      const { env } = await getCloudflareContext({ async: true });
      const hyperdriveUrl = env.HYPERDRIVE?.connectionString;
      
      // Only use Hyperdrive if it's not pointing to localhost (real production Hyperdrive)
      if (hyperdriveUrl && !hyperdriveUrl.includes('localhost')) {
        connectionString = hyperdriveUrl;
        isHyperdrive = true;
        console.log('[DB] Using production Hyperdrive connection');
      } else if (hyperdriveUrl) {
        console.log('[DB] Skipping local Hyperdrive simulation, using DATABASE_URL');
      }
    } catch (e) {
      console.log('[DB] Not in Cloudflare context');
    }

    // Fallback to DATABASE_URL
    if (!connectionString) {
      connectionString = process.env.DATABASE_URL;
      console.log('[DB] Using DATABASE_URL from environment');
    }
  }

  if (!connectionString) {
    throw new Error('No database connection string found. Please set DATABASE_URL or configure Hyperdrive.');
  }

  const sslConfig = connectionString.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false;

  const pool = new Pool({
    connectionString,
    maxUses: isHyperdrive ? 1 : undefined,
    max: isHyperdrive ? 1 : 10,
    ssl: sslConfig,
  });

  db = drizzle({ client: pool, schema });
  console.log('[DB] ✅ Database connection established');
  return db;
}

/**
 * Connect to Neon Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 */
// import { drizzle } from 'drizzle-orm/neon-http';
// const db = drizzle(process.env.DATABASE_URL!);

/**
 * Database connection with Drizzle
 * https://orm.drizzle.team/docs/connect-overview
 *
 * Drizzle <> PostgreSQL
 * https://orm.drizzle.team/docs/get-started-postgresql
 *
 * Get Started with Drizzle and Neon
 * https://orm.drizzle.team/docs/get-started/neon-new
 *
 * Drizzle with Neon Postgres
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 *
 * Drizzle <> Neon Postgres
 * https://orm.drizzle.team/docs/connect-neon
 *
 * Drizzle with Supabase Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 */
