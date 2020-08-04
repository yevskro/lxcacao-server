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
    INSERT INTO recipes (type, time, private) 
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
    INSERT INTO recipes (name, type, private) 
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
    INSERT INTO recipes (name, time, private) 
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

  it('cant create a recipe without private', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, time, type) 
        VALUES
    ('Beef Straganoff, '44m 30s', true');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create recipe with empty name', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private) 
        VALUES
    ('', 'Dinner', 'Entree', '25m', 'true');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create recipe with empty type', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private) 
        VALUES
    ('Beef Straganoff, '', '3hr', 'false');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create recipe with empty time', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree, '', 'false');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });

  it('cant create recipe with empty private', async (): Promise<void> => {
    query = `
    INSERT INTO recipes (name, type, time, private) 
        VALUES
    ('Beef Straganoff', 'Dinner Entree', '45m', '');`;

    let error;
    try {
      await pool.query(query);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBe(undefined);
  });
};
