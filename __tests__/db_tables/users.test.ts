import { Pool, QueryResult } from "pg";

describe("users table", (): void => {
  const conString: string =
    "postgres://postgres:postgres@127.0.0.1:5432/testdb";

  let pool: Pool;
  let query: string;

  beforeAll((): void => {
    pool = new Pool({
      connectionString: conString,
    });
  });

  afterAll(
    async (): Promise<void> => {
      return await pool.end();
    }
  );

  it("can query database", async (): Promise<void> => {
    const time = await pool.query("SELECT NOW();");
    expect(time).not.toBe(undefined);
  });

  it("is an empty table", async (): Promise<void> => {
    const result = await pool.query("SELECT * FROM users;");
    expect(result.rows.length).toBe(0);
  });

  it("can add a user", async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    try {
      await pool.query(query);
    } catch (err) {
      expect(err).toBe(undefined);
    }
  });

  it("cannot create a duplicate user", async (): Promise<void> => {
    query = `
    INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
        VALUES
    ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;

    try {
      await pool.query(query);
    } catch (err) {
      expect(err).not.toBe(undefined);
    }
  });

  it("last_update, create_update are timestamps", async (): Promise<void> => {
    const user = await pool.query("SELECT * FROM users WHERE users.id = 1;");
    console.log(user);
  });

  describe("can't create user without mandatory fields", (): void => {
    it("secure_key", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, last_name, login_ip) 
          VALUES
      ('test@gmail.com', 'test', 'test', '127.0.0.1');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("login_ip", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, last_name, secure_key) 
          VALUES
      ('test@gmail.com', 'test', 'test', '0000');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("last_name", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, login_ip, secure_key) 
          VALUES
      ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("first_name", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, last_name, login_ip, secure_key) 
          VALUES
      ('test@gmail.com', 'test', '127.0.0.1', '0000');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("gmail", async (): Promise<void> => {
      query = `
      INSERT INTO users (first_name, last_name, login_ip, secure_key) 
          VALUES
      ('test', 'test', '127.0.0.1', '0000');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });
  });

  describe("can't create user with empty string fields", (): void => {
    it("secure_key", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, last_name, login_ip, secure_key) 
          VALUES
      ('test@gmail.com', 'test', 'test', '127.0.0.1', '');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("login_ip", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, last_name, secure_key, login_ip) 
          VALUES
      ('test@gmail.com', 'test', 'test', '0000', '');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("last_name", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, first_name, login_ip, secure_key, last_name) 
          VALUES
      ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("first_name", async (): Promise<void> => {
      query = `
      INSERT INTO users (gmail, last_name, login_ip, secure_key, first_name) 
          VALUES
      ('test@gmail.com', 'test', '127.0.0.1', '0000', '');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });

    it("gmail", async (): Promise<void> => {
      query = `
      INSERT INTO users (first_name, last_name, login_ip, secure_key, gmail) 
          VALUES
      ('test', 'test', '127.0.0.1', '0000', '');`;

      try {
        await pool.query(query);
      } catch (err) {
        expect(err).not.toBe(undefined);
      }
    });
  });
});
