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

  it('can create a user and friend', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (user_id, friend_id)
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
    INSERT INTO users_chats (user_id, friend_id)
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

  it('wont create a friend with an invalid id', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (user_id, friend_id)
      VALUES
    (2, 4)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('wont create a record without a friend_id', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (user_id)
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
    INSERT INTO users_chats (friend_id)
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

  it('record has a last_update', async (): Promise<void> => {
    query = `
    SELECT last_update FROM users_chats WHERE users_chats.id = 1;
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('last_update cannot be null', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (user_id, friend_id, last_update)
    VALUES
    (1,1,null)
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('last_update can only be a timestamp', async (): Promise<void> => {
    query = `
    INSERT INTO users_chats (user_id, friend_id, last_update)
    VALUES
    (1,1,1)
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
