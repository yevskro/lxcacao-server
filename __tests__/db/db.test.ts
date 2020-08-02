import users from './tables/users.test';
import users_friends from './tables/users_friends.test';
import users_blocks from './tables/users_blocks.test';

describe('database test!', (): void => {
  describe('users table', users);
  describe('users_friends table', users_friends);
  describe('users_blocks table', users_blocks);
});
