/* eslint-disable camelcase */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Tests the recipes table's columns.
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.

  Columns:
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (name <> ''),
    time TEXT NOT NULL CHECK (time <> ''),
    type TEXT NOT NULL CHECK (type <> ''),
    private BOOLEAN NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    how_to_prepare TEXT[] NOT NULL DEFAULT '{}',
    user_id INTEGER NOT NULL REFERENCES users(id),
    origin_user_id INTEGER NOT NULL REFERENCES users(id),
    origin_user_full_name TEXT NOT NULL CHECK (origin_user_full_name <> ''),
    img_file_name TEXT NOT NULL DEFAULT '',
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

  it('can add a recipe', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, time, type, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', '1hr 15m', 'Dinner Entree', 'false', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM recipes WHERE recipes.name = 'Beef Straganoff';`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('img_file_name has a default value of an empty string', async (): Promise<
    void
  > => {
    const { img_file_name } = (
      await pool.query(
        "SELECT * FROM recipes WHERE recipes.name = 'Beef Straganoff';"
      )
    ).rows[0];
    expect(img_file_name).toBe('');
  });

  it('cant create a recipe without a name', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (type, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Dinner Entree', '1hr 15m', 'false', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a recipe without time', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', 'true', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a recipe without type', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', '55m', 'false', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a recipe without private', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, time, type, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', '44m 30s', 'Dinner Entree', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create recipe with empty name', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('', 'Dinner Entree', '25m', 'true', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create recipe with empty type', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', '', '3hr', 'false', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create recipe with empty time', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', '', 'false', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create recipe with empty private', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', '45m', '', 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.INVALID_TEXT_REPRESENTATION
    );
  });

  it('can save an array into ingredients', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, ingredients, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', '45m', 'false', ARRAY['1 cucumber','2 pickles'], 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('can save an array into how_to_prepare', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private, how_to_prepare, origin_user_id, origin_user_full_name, main_user_id) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', '45m', 'false', ARRAY['cook beef','cook fries'], 1, 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('has a default value of an empty array in ingredients', async (): Promise<
    void
  > => {
    query = `
      SELECT ingredients FROM recipes WHERE recipes.id = 1;`;

    const { ingredients } = (await pool.query(query)).rows[0];
    expect(ingredients).toStrictEqual([]);
  });

  it('has a default value of an empty array in how_to_prepare', async (): Promise<
    void
  > => {
    query = `
    SELECT how_to_prepare FROM recipes WHERE recipes.id = 1;`;
    const { how_to_prepare } = (await pool.query(query)).rows[0];
    expect(how_to_prepare).toStrictEqual([]);
  });

  it('has a origin_user_id', async (): Promise<void> => {
    query = `
    SELECT origin_user_id FROM recipes WHERE recipes.id = 1;`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('cant create a recipe with an invalid origin_user_id', async (): Promise<
    void
  > => {
    query = `
    INSERT INTO recipes (name, type, time, private, origin_user_id, origin_user_full_name, main_user_id)
      VALUES
    ('Beef Straganoff', 'Dinner Entree', '1hr', 'true', '1000', 'Yev Skro', 1);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.FOREIGN_KEY_VIOLATION
    );
  });
};
