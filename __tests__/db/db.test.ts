import users from './tables/users.test';
import users_friends from './tables/users_friends.test';
import users_blocked from './tables/users_blocked.test';

describe('database test!', (): void => {
  describe('users table', users);
  describe('users_friends table', users_friends);
  describe('users_blocked table', users_blocked);
});
