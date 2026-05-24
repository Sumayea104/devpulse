import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // এই লাইনটি যোগ করুন
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;