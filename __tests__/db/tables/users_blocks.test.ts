/* eslint-disable camelcase */
import { Pool } from 'pg';

export default (): void => {
  const conString: string = 'postgres://postgres@127.0.0.1:5432/testdb';

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
    try {
      await pool.query(query);
    }
    catch (err) {
      expect(err).toBe(undefined);
    }
  });

  it('wont create a user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (user_id, block_id)
      VALUES
    (4, 2)
    `;
    try {
      const p = await pool.query(query);
    }
    catch (err) {
      expect(err).not.toBe(undefined);
    }
  });

  it('wont create a block user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (user_id, block_id)
      VALUES
    (2, 4)
    `;
    try {
      await pool.query(query);
    }
    catch (err) {
      expect(err).not.toBe(undefined);
    }
  });

  it('wont create a record without a block_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (user_id)
      VALUES
    (1)
    `;
    try {
      await pool.query(query);
    }
    catch (err) {
      expect(err).not.toBe(undefined);
    }
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocks (request_id)
      VALUES
    (1)
    `;
    try {
      await pool.query(query);
    }
    catch (err) {
      expect(err).not.toBe(undefined);
    }
  });

  it('record has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM users_blocks WHERE users_blocks.id=1;
    `;
    try {
      await pool.query(query);
    }
    catch (err) {
      expect(err).toBe(undefined);
    }
  });
};