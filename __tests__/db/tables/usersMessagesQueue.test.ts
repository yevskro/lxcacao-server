/* eslint-disable camelcase */
/* camelCase have been disabled because sql names are snake cased */
/*
  Author: Yevgeniy Skroznikov
  Date: August 13 2020
  Description:
  Tests the users_messages_queue table's columns.
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.


  The tests are error driven from the database. Assertions are made on
  database throwing errors when checking constraints. 

  And for default value assertions we read the field from a database 
  and assert it to the default value the database should have.

  Columns:
    id SERIAL PRIMARY KEY,
    main_user_id INTEGER NOT NULL REFERENCES users(id),
    peer_user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL DEFAULT '',
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
*/

import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';
import queryErrorHelper from '../helpers/queryErrorHelper';

export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let query: string;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can create a users_messages_queue record', async (): Promise<void> => {
    query = `
    INSERT INTO users_messages_queue (peer_user_id, main_user_id)
      VALUES
    (1, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('wont create a record with an invalid peer_user_id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_messages_queue (peer_user_id, main_user_id)
      VALUES
    (400, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record with an invalid main_user_id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_messages_queue (peer_user_id, main_user_id)
      VALUES
    (2, 400);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record without a main_user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_messages_queue (peer_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('wont create a record without a peer_user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_messages_queue (main_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('record has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM users_messages_queue WHERE id = 1;`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });
};
