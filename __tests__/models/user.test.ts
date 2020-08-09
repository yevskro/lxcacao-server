/*
    Author: Yevgeniy Skroznikov
    Date: August 7 2020
*/

import { Pool } from 'pg';
import User, { UserData } from '../../src/models/User';

describe('users model test suite', (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());

  it('can create a user', async (): Promise<void> => {
    expect(
      typeof (await User.create(pool, {
        gmail: 'durran@gmail.com',
        first_name: 'durran',
        last_name: 'durran',
        login_ip: '127.0.0.1',
        secure_key: '1337',
      }))
    ).toBe('number');
  });

  it('invokes on error callback when database throws on creation', async (): Promise<
    void
  > => {
    const onError = jest.fn();
    await User.create(
      pool,
      {
        gmail: 'durran@gmail.com',
        first_name: 'durran',
        last_name: 'durran',
        login_ip: '127.0.0.1',
        secure_key: '1337',
      },
      onError
    );
    expect(onError).toBeCalled();
  });

  it('can query customizable user data by id', async (): Promise<void> => {
    const data: UserData = await User.readUserDataById(pool, 1, {
      gmail: true,
      first_name: true,
      last_name: true,
    });
    expect(data.gmail).toStrictEqual('root@gmail.com');
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
  });

  it('can query customizable user data by gmail', async (): Promise<void> => {
    const data: UserData = await User.readUserDataByGmail(
      pool,
      'root@gmail.com',
      {
        id: true,
        first_name: true,
        last_name: true,
        img_file_name: true,
      }
    );

    expect(data.id).toBe(1);
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
    expect(data.img_file_name).toStrictEqual('test.png');
  });

  it('can create a recipe that belongs to a user', (): void => {
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
});
