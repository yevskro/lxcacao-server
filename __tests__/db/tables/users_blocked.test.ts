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

  it('can create a user and blocked user', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocked (user_id, blocked_id)
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
    INSERT INTO users_blocked (user_id, blocked_id)
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

  it('wont create a blocked user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_blocked (user_id, blocked_id)
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
};