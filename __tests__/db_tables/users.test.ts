import { Pool, QueryResult } from "pg";

describe("database tests", (): void => {
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

  it("can query database", async (): Promise<QueryResult<any>> => {
    const time = await pool.query("SELECT NOW();");
    expect(time).not.toBe(undefined);
    return time;
  });

  it("is an empty table", async (): Promise<QueryResult<any>> => {
    const result = await pool.query("SELECT * FROM users;");
    console.log(result);
    return result;
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
});
