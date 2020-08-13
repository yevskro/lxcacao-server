/* eslint-disable camelcase */
/* camelCase have been disabled because sql names are snake cased */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Tests the users_friends table's columns.
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

  it('can create a users_friends record', async (): Promise<void> => {
    /* if the database processes the query without an error 
    the query was sucessful and queryError helper returns undefined 
    */
    query = `
    INSERT INTO users_friends (peer_user_id, main_user_id)
      VALUES
    (1, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('wont create a record with an invalid peer_user_id', async (): Promise<
    void
  > => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users_friends (peer_user_id, main_user_id)
      VALUES
    (400, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record with an invalid main_user_id', async (): Promise<
    void
  > => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users_friends (peer_user_id, main_user_id)
      VALUES
    (2, 400);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record without a main_user_id', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users_friends (peer_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('wont create a record without a peer_user_id', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users_friends (main_user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('record has a create_date', async (): Promise<void> => {
    /* if the database processes the query without an error 
    the query was sucessful and queryError helper returns undefined 
    */
    query = `
    SELECT create_date FROM users_friends WHERE users_friends.id = 1;`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });
};
