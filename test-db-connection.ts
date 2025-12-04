import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:');
    console.error(err);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful!');
    console.log('Server time:', res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});
