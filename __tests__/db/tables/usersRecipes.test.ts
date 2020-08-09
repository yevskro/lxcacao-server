/* eslint-disable camelcase */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Tests the users_recipes table's columns.
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.

  Columns:
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    recipe_id INTEGER NOT NULL REFERENCES recipes(id)
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

  it('can create a user and recipe relationship', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (user_id, recipe_id)
      VALUES
    (1, 1);`;
    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('wont create a record with an invalid user id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_recipes (user_id, recipe_id)
      VALUES
    (400, 2);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record with an invalid recipe id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO users_recipes (user_id, recipe_id)
      VALUES
    (2, 200);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });

  it('wont create a record without a recipe_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (user_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (recipe_id)
      VALUES
    (1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });
};
