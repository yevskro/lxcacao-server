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

  it('can create a users friend', async (): Promise<void> => {
    query = `
    INSERT INTO users_friends (user_id, friend_id)
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
};
