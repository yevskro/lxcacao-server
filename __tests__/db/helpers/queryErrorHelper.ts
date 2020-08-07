import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';

export default async (pool: Pool, query: string): Promise<PostgresError> => {
  let error: PostgresError;
  try {
    await pool.query(query);
  } catch (err) {
    error = err.code;
  }
  return error;
};
