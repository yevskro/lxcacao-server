/* eslint-disable camelcase */
import { Pool } from 'pg';
import usersTest from './tables/users.test';
import usersFriendsTest from './tables/usersFriends.test';
import usersBlocksTest from './tables/usersBlocks.test';
import usersRequestsTest from './tables/usersRequests.test';
import recipesTest from './tables/recipes.test';
import usersRecipesTest from './tables/usersRecipes.test';
import usersChatsTest from './tables/usersChats.test';
import queryErrorHelperTest from './helpers/queryErrorHelper.test';
import queryErrorHelper from './helpers/queryErrorHelper';

describe('database test', (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  describe('query error helper', queryErrorHelperTest);

  it('can query database', async (): Promise<void> => {
    expect(await queryErrorHelper(pool, 'SELECT NOW();')).toBe(undefined);
  });

  describe('users table', usersTest);
  describe('users_friends table', usersFriendsTest);
  describe('users_blocks table', usersBlocksTest);
  describe('users_requests', usersRequestsTest);
  describe('recipes table', recipesTest);
  describe('users_recipes table', usersRecipesTest);
  describe('users_chats table', usersChatsTest);
});
