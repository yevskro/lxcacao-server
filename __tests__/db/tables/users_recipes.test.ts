/* eslint-disable camelcase */
import { Pool } from 'pg';

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
    (1, 2)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('wont create a user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (user_id, recipe_id)
      VALUES
    (4, 2)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a recipe with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (user_id, recipe_id)
      VALUES
    (2, 200)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a record without a recipe_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (user_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_recipes (recipe_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });
};
