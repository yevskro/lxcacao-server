/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Exporting a helper function for tests that
  that query a postgres database and test
  the error code.
*/

import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';

export default async (pool: Pool, query: string): Promise<PostgresError> => {
  /* The error code is an enum type PostgresError.
  If there is no error undefined is returned. */
  let error: PostgresError;

  try {
    await pool.query(query);
  } catch (err) {
    error = err.code;
  }

  return error;
};
