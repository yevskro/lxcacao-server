import { Pool } from 'pg';
import users from '/tables/users_friends.ts';

describe('database test', () => {
    const conString: string = 'postgres://postgres@127.0.0.1:5432/testdb';

    let pool: Pool;

    beforeAll((): void => {
        try {
            pool = new Pool({ connectionString: conString });
        } catch (err) {
            console.log(err);
        }
    });

    afterAll(async (): Promise<void> => pool.end());

    describe('users table', users(pool));
});
