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

  it('can create a user and request', async (): Promise<void> => {
    query = `
    INSERT INTO users_requests (user_id, request_id)
      VALUES
    (1, 2)
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('wont create a user with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_friends (user_id, request_id)
      VALUES
    (4, 2)
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a friend with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_friends (user_id, request_id)
      VALUES
    (2, 4)
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a record without a request_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_requests (user_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a record without a user_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_requests (request_id)
      VALUES
    (1)
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('record has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM users_requests WHERE users_requests.id=1;
    `;
    let error;
    try {
      await pool.query(query);
    }
    catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });
};