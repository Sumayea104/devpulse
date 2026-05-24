import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

export const query = (
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult> => pool.query(text, params);

export default pool;