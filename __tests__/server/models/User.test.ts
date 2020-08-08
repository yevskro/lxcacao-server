/*
    Author: Yevgeniy Skroznikov
    Date: August 7 2020
*/

import { Pool } from 'pg';
import User from '../../../src/models/User';

export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let user: User;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can be instanciated', (): void => {
    user = new User(1);
    expect(user instanceof User).toBe(true);
  });

  it('can get the user id', (): void => {
    expect(user.getId()).toBe(1);
  });

  it('can create a user', async (): Promise<void> => {
    expect(
      (await User.create(pool, {
        gmail: 'durran@gmail.com',
        firstName: 'durran',
        lastName: 'durran',
        loginIP: '127.0.0.1',
        secureKey: '1337',
      })) instanceof User
    ).toBe(true);
  });

  it('returns an error when database throws on creation', async (): Promise<
    void
  > => {
    expect(
      (await User.create(pool, {
        gmail: 'durran@gmail.com',
        firstName: 'durran',
        lastName: 'durran',
        loginIP: '127.0.0.1',
        secureKey: '1337',
      })) instanceof Error
    ).toBe(true);
  });

  it('has a customizable get fields method', (): void => {
    console.log('stub');
  });

  it('has a get a single recipe method', (): void => {
    console.log('stub');
  });

  it('has a get all recipes method', (): void => {
    console.log('stub');
  });

  it('has a get friend requests method', (): void => {
    console.log('stub');
  });

  it('has a get friends method', (): void => {
    console.log('stub');
  });

  it('has a delete friend method', (): void => {
    console.log('stub');
  });

  it('has a get users blocks method', (): void => {
    console.log('stub');
  });

  it('has a copy recipe method', (): void => {
    console.log('stub');
  });

  it('has a delete recipe method', (): void => {
    console.log('stub');
  });

  it('has an add recipe method', (): void => {
    console.log('stub');
  });

  it('has an update recipe method', (): void => {
    console.log('stub');
  });

  it('has a create recipe method', (): void => {
    console.log('stub');
  });

  it('has a friend request method', (): void => {
    console.log('stub');
  });

  it('has a delete friend request method', (): void => {
    console.log('stub');
  });

  it('has an accept friend request method', (): void => {
    console.log('stub');
  });

  it('has a block user method', (): void => {
    console.log('stub');
  });

  it('has an unblock user method', (): void => {
    console.log('stub');
  });

  it('can update the profile image', (): void => {
    console.log('stub');
  });

  it('can update the last_udate', (): void => {
    console.log('stub');
  });
};
