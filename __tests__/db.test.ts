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
    const time = await pool.query("SELECT NOW()");
    expect(time).not.toBe(undefined);
    return time;
  });

  it("can add a user", async () => {
    query = `
        INSERT INTO users (gmail, firstName, lastName, loginIP, secureKey) 
            VALUES
        ('test@gmail.com', 'test', 'test', '127.0.0.1', '0000');`;
    await pool.query(query);
    query = `SELECT * FROM users`;
    console.log(await pool.query(query));
  });
});
