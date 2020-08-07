/* eslint-disable camelcase */
import users from './tables/users.test';
import users_friends from './tables/users_friends.test';
import users_blocks from './tables/users_blocks.test';
import users_requests from './tables/users_requests.test';
import recipes from './tables/recipes.test';
import users_recipes from './tables/users_recipes.test';
import users_chats from './tables/users_chats.test';

describe('database test', (): void => {
  describe('users table', users);
  describe('users_friends table', users_friends);
  describe('users_blocks table', users_blocks);
  describe('users_requests', users_requests);
  describe('recipes table', recipes);
  describe('users_recipes', users_recipes);
  describe('users_chats', users_chats);
});
