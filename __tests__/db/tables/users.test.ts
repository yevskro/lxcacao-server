/* eslint-disable camelcase */
/* camelCase have been disabled because sql names are snake cased */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  Tests the users table's columns.
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.

  The tests are error driven from the database. Assertions are made on
  database throwing errors when checking constraints. 

  And for default value assertions we read the field from a database 
  and assert it to the default value the database should have.

  Columns:
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL CHECK (gmail <> ''),
    first_name TEXT NOT NULL CHECK (first_name <> ''),
    last_name TEXT NOT NULL CHECK (last_name <> ''),
    login_ip TEXT NOT NULL CHECK (login_ip <> ''),
    secure_key TEXT UNIQUE NOT NULL CHECK (secure_key <> ''),
    img_file_name TEXT DEFAULT '',
    last_update TIMESTAMP NOT NULL DEFAULT NOW(),
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
*/

import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';
import queryErrorHelper from '../helpers/queryErrorHelper';

export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let query: string;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can add a user', async (): Promise<void> => {
    /* if the database processes the query without an error 
    the query was sucessful and queryError helper returns undefined 
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(undefined);
  });

  it('cannot create a duplicate user', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.UNIQUE_VIOLATION
    );
  });

  it('last_cache_update, create_date are identical timestamps', async (): Promise<
    void
  > => {
    /* read last_cache_update and create_date and compare them on first creation
      of a record they are to be identical
    */
    const { last_cache_update, create_date } = (
      await pool.query(
        'SELECT last_cache_update, create_date FROM users WHERE users.id = 1;'
      )
    ).rows[0];
    expect(last_cache_update.length).not.toBe(0);
    expect(create_date.length).not.toBe(0);
    expect(last_cache_update).toStrictEqual(create_date);
  });

  it('secure_key is a unique key', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test1@gmail.com', 'test1', 'test1', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.UNIQUE_VIOLATION
    );
  });

  it('last_update cannot be null', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key, last_cache_update) 
        VALUES
    ('test1@gmail.com', 'test1', 'test1', '127.0.0.1', '0005', null);`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('last_update cannot be an empty string', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key, last_cache_update) 
        VALUES
    ('test1@gmail.com', 'test1', 'test1', '127.0.0.1', '0005', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.INVALID_DATETIME_FORMAT
    );
  });

  it('img_file_name has a default value of an empty string', async (): Promise<
    void
  > => {
    /* read field from the database and assert it for the default value */
    const { img_file_name } = (
      await pool.query(
        `SELECT * FROM users WHERE users.gmail = 'test@gmail.com';`
      )
    ).rows[0];
    expect(img_file_name).toBe('');
  });

  it('cant create a user without secure_key', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a user without login_ip', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a user without last_name', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a user without first_name', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create a user without gmail', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test', 'test', '127.0.0.1', '0000');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.NOT_NULL_VIOLATION
    );
  });

  it('cant create user with empty secure_key', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create user with empty login_ip', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, last_name, secure_key, login_ip) 
        VALUES
    ('test@gmail.com', 'test', 'test', '0000', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create user with empty last_name', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, first_name, login_ip, secure_key, last_name) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create user with empty first_name', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (gmail, last_name, login_ip, secure_key, first_name) 
        VALUES
    ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });

  it('cant create user with empty gmail', async (): Promise<void> => {
    /* expect the database to error when going through its constraints
    on a specific invalid field
    */
    query = `
    INSERT INTO users (first_name, last_name, login_ip, secure_key, gmail) 
        VALUES
    ('test', 'test', '127.0.0.1', '0000', '');`;

    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.CHECK_VIOLATION
    );
  });
};
