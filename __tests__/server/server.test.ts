/*
    Author: Yevgeniy Skroznikov
    Date: August 7 2020
*/

import UserTest from './models/User.test';
import RecipeTest from './models/Recipe.test';

describe('server test suite', (): void => {
  describe('user model test', UserTest);
  describe('recipe model test', RecipeTest);
});
