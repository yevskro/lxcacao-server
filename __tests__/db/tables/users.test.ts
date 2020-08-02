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

  it('can query database', async (): Promise<void> => {
    const time = await pool.query('SELECT NOW();');
    expect(time).not.toBe(undefined);
  });

  it('can add a user', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('cannot create a duplicate user', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('last_update, create_update are identical timestamps', async (): Promise<void> => {
    const { last_update, create_date } = (
      await pool.query('SELECT * FROM users WHERE users.id = 1;')
    ).rows[0];
    expect(last_update.length).not.toBe(0);
    expect(create_date.length).not.toBe(0);
    expect(last_update).toStrictEqual(create_date);
  });

  it('secure_key is a unique key', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test1@gmail.com', 'test1', 'test1', '127.0.0.1', '0000');`;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('img_file_name has a default value of an empty string', async (): Promise<void> => {
    const { img_file_name } = (await pool.query('SELECT * FROM users WHERE users.id = 1;')).rows[0];
    expect(img_file_name).toBe('');
  });

  it('cant create a user without secure_key', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a user without login_ip', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a user without last_name', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a user without first_name', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a user without gmail', async (): Promise<void> => {
    query = `
    INSERT INTO users (first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test', 'test', '127.0.0.1', '0000');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create user with empty secure_key', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create user with empty login_ip', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, secure_key, login_ip) 
        VALUES
    ('test@gmail.com', 'test', 'test', '0000', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create user with empty last_name', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, login_ip, secure_key, last_name) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create user with empty first_name', async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, last_name, login_ip, secure_key, first_name) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create user with empty gmail', async (): Promise<void> => {
    query = `
    INSERT INTO users (first_name, last_name, login_ip, secure_key, gmail) 
        VALUES
    ('test', 'test', '127.0.0.1', '0000', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });
};
