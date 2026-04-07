import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isSSL = process.env.DB_HOST !== 'localhost';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'solo_parenting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: isSSL ? { rejectUnauthorized: false } : false,
  // Supabase pooler requires no prepared statements
  ...(isSSL && { options: '-c statement_timeout=30000' }),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
