/* eslint-disable camelcase */
import usersTest from './tables/users.test';
import usersFriendsTest from './tables/usersFriends.test';
import usersBlocksTest from './tables/usersBlocks.test';
import usersRequestsTest from './tables/usersRequests.test';
import recipesTest from './tables/recipes.test';
import usersRecipesTest from './tables/usersRecipes.test';
import usersChatsTest from './tables/usersChats.test';
import queryErrorHelperTest from './helpers/queryErrorHelper.test';

describe('database test', (): void => {
  describe('query error helper', queryErrorHelperTest);
  describe('users table', usersTest);
  describe('users_friends table', usersFriendsTest);
  describe('users_blocks table', usersBlocksTest);
  describe('users_requests', usersRequestsTest);
  describe('recipes table', recipesTest);
  describe('users_recipes', usersRecipesTest);
  describe('users_chats', usersChatsTest);
});
