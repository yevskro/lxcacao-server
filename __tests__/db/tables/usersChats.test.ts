/* eslint-disable camelcase */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Tests the users_chats table's columns.
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.

  Columns:
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    msgs TEXT[] NOT NULL DEFAULT '{}',
    last_cache_update TIMESTAMP NOT NULL DEFAULT NOW()
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

  it('can create a to user and from user', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (to_user_id, from_user_id)
      VALUES
    (1, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('wont create a record with an invalid to user id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_chats (to_user_id, from_user_id)
      VALUES
    (400, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record with an invalid from_user_id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_chats (to_user_id, from_user_id)
      VALUES
    (2, 400);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (from_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('wont create a record without a from_user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (to_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('record has a last_cache_update', async (): Promise<void> => {
    query = `
    SELECT last_cache_update FROM users_chats WHERE users_chats.id = 1;`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('last_cache_update cannot be null', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (from_user_id, to_user_id, last_cache_update)
    VALUES
    ( 1, 1, null )`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('last_cache_update can only be a timestamp', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (from_user_id, to_user_id, last_cache_update)
    VALUES
    ( 1, 1, 1 )`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.DATATYPE_MISMATCH
    );
  });
};
