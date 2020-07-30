import { Pool } from "pg";

describe("database tests", () => {
  const conString: string =
    "postgres://postgres:postgres@127.0.0.1:5432/testdb";

  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: conString,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("can qquery database", async () => {
    const time = await pool.query("SELECT NOW()");
    expect(time).not.toBe(undefined);
  });
});
