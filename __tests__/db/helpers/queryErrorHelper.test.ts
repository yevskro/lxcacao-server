import { Pool } from 'pg';
import { PostgresError } from 'pg-error-enum';
import queryErrorHelper from './queryErrorHelper';

export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let query: string;
  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can test an error from a query', async (): Promise<void> => {
    query = 'SELECT * FROM nonexistingtable;';
    expect(await queryErrorHelper(pool, query)).toBe(
      PostgresError.UNDEFINED_TABLE
    );
  });
};
