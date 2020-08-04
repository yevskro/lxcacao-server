/* eslint-disable camelcase */
import { Pool } from 'pg';
/*  
    name TEXT NOT NULL CHECK (name <> ''),
    time TEXT NOT NULL CHECK (name <> ''),
    type TEXT NOT NULL CHECK (type <> ''),
    private BOOLEAN NOT NULL,

    ingredients TEXT[] NOT NULL DEFAULT {''},
    how_to_prepare TEXT[] NOT NULL DEFAULT {''},
    from_id INTEGER REFERENCES users(id) DEFAULT 0,
    from_full_name TEXT DEFAULT '',
    img_file_name TEXT NOT NULL DEFAULT '',
    create_date TIMESTAMP DEFAULT NOW() 

    check a recipe can be created with mandotory fields
    check a recipe can't be created without mandatory fields
    check a recipe can be created with all fields
    check mandotory fields can't be null or empty strings
    check ingredients and how to prepare can hold arrays
*/
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
    INSERT INTO recipes (name, time, type, private) 
        VALUES
    ('Beef Straganoff', '1hr 15m', 'Dinner Entree', 'false');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('has a create_date', async (): Promise<void> => {
    query = `
    SELECT create_date FROM recipes WHERE recipes.id=1;
    `;
    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });

  it('img_file_name has a default value of an empty string', async (): Promise<
    void
  > => {
    const { img_file_name } = (
      await pool.query('SELECT * FROM recipes WHERE recipes.id = 1;')
    ).rows[0];
    expect(img_file_name).toBe('');
  });

  it('cant create a recipe without a name', async (): Promise<void> => {
    query = `
    INSERT INTO users (type, time, private) 
        VALUES
    ('Dinner Entree', '1hr 15m', 'false');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a recipe without time', async (): Promise<void> => {
    query = `
    INSERT INTO users (name, type, private) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', 'true');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create a recipe without type', async (): Promise<void> => {
    query = `
    INSERT INTO users (name, time, private) 
        VALUES
    ('Beef Straganoff', '55m', 'false');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  xit('cant create a user without first_name', async (): Promise<void> => {
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

  xit('cant create a user without gmail', async (): Promise<void> => {
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

  xit('cant create user with empty secure_key', async (): Promise<void> => {
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

  xit('cant create user with empty login_ip', async (): Promise<void> => {
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

  xit('cant create user with empty last_name', async (): Promise<void> => {
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

  xit('cant create user with empty first_name', async (): Promise<void> => {
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

  xit('cant create user with empty gmail', async (): Promise<void> => {
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
