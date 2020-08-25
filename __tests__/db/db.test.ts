/* eslint-disable camelcase */
/*
  Author: Yevgeniy Skroznikov
  Date: August 7 2020
  Description:
  The tests are done to run in order because other tests depend
  on the preceding test.

  Test suite for the server's PostgreSQL test database(testdb).
  Tests for uniqueness, checks for invalid null fields, invalid empty strings,
  valid foreign keys, and valid timestamp types.

  Look at root/src/db/create.sql to see the tables that are tested.
*/

import { Pool } from 'pg';
import testSetupDbHelper from '../helpers/testSetupDbHelper';
import queryErrorHelperTest from './helpers/queryErrorHelper.test';
import queryErrorHelper from './helpers/queryErrorHelper';
import usersTest from './tables/users.test';
import usersFriendsTest from './tables/usersFriends.test';
import usersBlocksTest from './tables/usersBlocks.test';
import usersRequestsTest from './tables/usersRequests.test';
import recipesTest from './tables/recipes.test';
import usersMessagesQueue from './tables/usersMessagesQueue.test';

describe('database test suite', (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  describe('query error helper', queryErrorHelperTest);

  it('can clear and setup a testdb', async () =>
    expect(await testSetupDbHelper()).toBe(true));

  it('can query database', async (): Promise<void> => {
    expect(await queryErrorHelper(pool, 'SELECT NOW();')).toBe(undefined);
  });

  describe('users table', usersTest);
  describe('users_friends table', usersFriendsTest);
  describe('users_blocks table', usersBlocksTest);
  describe('users_requests', usersRequestsTest);
  describe('recipes table', recipesTest);
  describe('users_messages_queue', usersMessagesQueue);
});
