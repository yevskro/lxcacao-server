/* eslint-disable camelcase */
import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';

export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let query: string;
  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can create a user and a block user', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks(user_id, block_id)
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
    INSERT INTO users_blocks (user_id, block_id)
      VALUES
    (4, 2)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }

    expect(error.code).toBe(PostgresError.FOREIGN_KEY_VIOLATION);
  });

  it('wont create a block user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (user_id, block_id)
      VALUES
    (2, 4)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }

    expect(error.code).toBe(PostgresError.FOREIGN_KEY_VIOLATION);
  });

  it('wont create a record without a block_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (user_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }

    expect(error.code).toBe(PostgresError.NOT_NULL_VIOLATION);
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (block_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }

    expect(error.code).toBe(PostgresError.NOT_NULL_VIOLATION);
  });

  it('record has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM users_blocks WHERE users_blocks.id=1;
    `;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });
};
