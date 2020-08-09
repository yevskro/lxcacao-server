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

  afterAll(
    async (): Promise<void> => {
      pool.end();
      User.poolEnd();
    }
  );

  it('can create a user', async (): Promise<void> => {
    expect(
      typeof (
        await User.create({
          gmail: 'durran@gmail.com',
          first_name: 'durran',
          last_name: 'durran',
          login_ip: '127.0.0.1',
          secure_key: '1337',
        })
      ).id
    ).toBe('number');
  });

  it('can create a user with img_file_name', async (): Promise<void> => {
    expect(
      typeof (
        await User.create({
          gmail: 'durran2@gmail.com',
          first_name: 'durran',
          last_name: 'durran',
          login_ip: '127.0.0.1',
          secure_key: '1338',
          img_file_name: 'test.png',
        })
      ).id
    ).toBe('number');
    const query = `SELECT img_file_name FROM users WHERE users.gmail = 'durran2@gmail.com'`;
    expect((await pool.query(query)).rows[0].img_file_name).toStrictEqual(
      'test.png'
    );
  });

  it('invokes an error callback and returns undefined on error', async (): Promise<
    void
  > => {
    const onError = jest.fn();
    expect(
      await User.create(
        {
          gmail: 'durran@gmail.com',
          first_name: 'durran',
          last_name: 'durran',
          login_ip: '127.0.0.1',
          secure_key: '1337',
        },
        onError
      )
    ).toBe(undefined);
    expect(onError).toBeCalled();
  });

  it('can query customizable user data by id', async (): Promise<void> => {
    const data: UserData = await User.readUserById(1, {
      gmail: true,
      first_name: true,
      last_name: true,
    });
    expect(data.gmail).toStrictEqual('root@gmail.com');
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
  });

  it('can query customizable user data by gmail', async (): Promise<void> => {
    const data: UserData = await User.readUserByGmail('root@gmail.com', {
      id: true,
      first_name: true,
      last_name: true,
      img_file_name: true,
    });

    expect(data.id).toBe(1);
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
    expect(data.img_file_name).toStrictEqual('test.png');
  });

  it('can update users data', async (): Promise<void> => {
    await User.updateUser(1, { first_name: 'Yev', last_name: 'Skro' });
    const result = await User.readUserById(1, {
      first_name: true,
      last_name: true,
    });
    expect(result.first_name).toStrictEqual('Yev');
    expect(result.last_name).toStrictEqual('Skro');
  });

  it('can create a recipe that belongs to a user', async (): Promise<void> => {
    const result = await User.createRecipe({
      user_id: 1,
      name: 'Beef Straganoff',
      time: '1hr 15m',
      type: 'Dinner Entree',
      private: false,
      origin_user_id: 1,
      origin_user_full_name: 'Yev Skro',
    });
    expect(result).not.toBe(undefined);
    expect(typeof result.id).toBe('number');
  });

  it('can update a users recipe', async (): Promise<void> => {
    const onError = jest.fn();
    await User.updateRecipe(1, { name: 'Bubblegum Jonie' }, onError);
    expect(onError).not.toBeCalled();
  });

  it('can read a users recipe', async (): Promise<void> => {
    const result = await User.readRecipe(1, { user_id: true });
    expect(result).not.toBe(undefined);
    expect(result.user_id).toBe(1);
  });

  it('can delete a users recipe', async (): Promise<void> => {
    const onError = jest.fn();
    await User.deleteRecipe(2, onError);
    expect(onError).not.toBeCalled();
    expect(await User.readRecipe(2, { user_id: true }, onError)).toBe(
      undefined
    );
  });

  it('can get all users recipe', async (): Promise<void> => {
    const amountOfRecipes = (await User.readAllRecipes(1, { user_id: true }))
      .length;
    await User.createRecipe({
      user_id: 1,
      name: 'Banana Icecream Pants',
      time: '1hr',
      type: 'Desert',
      private: false,
      origin_user_id: 1,
      origin_user_full_name: 'Yev Skro',
    });
    expect((await User.readAllRecipes(1, { user_id: true })).length).toBe(
      amountOfRecipes + 1
    );
  });

  it('can create a friend request', async (): Promise<void> => {
    const onError = jest.fn();
    await User.createFriendRequest({ user_id: 2, from_user_id: 1 }, onError);
    expect(onError).not.toBeCalled();
  });

  it('can read all friend requests', async (): Promise<void> => {
    const ammountOfRequests = (
      await User.readAllFriendRequests(2, {
        user_id: true,
        from_user_id: true,
      })
    ).length;

    await User.createFriendRequest({ user_id: 2, from_user_id: 3 });

    expect(
      (
        await User.readAllFriendRequests(2, {
          user_id: true,
          from_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    const ids = await User.readAllFriendRequests(2, {
      id: true,
      from_user_id: true,
    });

    const usersRequest = ids.find(
      (requestData) => requestData.from_user_id === 3
    );

    await User.deleteFriendRequest(usersRequest.id);
    expect(
      (await User.readAllFriendRequests(2, { user_id: true })).length
    ).toBe(ids.length - 1);
  });

  it('can create a friend', async (): Promise<void> => {
    const onError = jest.fn();
    await User.createFriend({ user_id: 2, from_user_id: 1 }, onError);
    expect(onError).not.toBeCalled();
  });

  it('can read all friend requests', async (): Promise<void> => {
    const ammountOfRequests = (
      await User.readAllFriends(2, {
        user_id: true,
        from_user_id: true,
      })
    ).length;

    await User.createFriend({ user_id: 2, from_user_id: 3 });

    expect(
      (
        await User.readAllFriends(2, {
          user_id: true,
          from_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    const ids = await User.readAllFriends(2, {
      id: true,
      from_user_id: true,
    });

    const usersFriend = ids.find((friendData) => friendData.from_user_id === 3);

    await User.deleteFriend(usersFriend.id);
    expect((await User.readAllFriends(2, { user_id: true })).length).toBe(
      ids.length - 1
    );
  });

  it('can create a block', async (): Promise<void> => {
    const onError = jest.fn();
    await User.createBlock({ user_id: 2, from_user_id: 1 }, onError);
    expect(onError).not.toBeCalled();
  });

  it('can read all blocks', async (): Promise<void> => {
    const ammountOfRequests = (
      await User.readAllBlocks(2, {
        user_id: true,
        from_user_id: true,
      })
    ).length;

    await User.createBlock({ user_id: 2, from_user_id: 3 });

    expect(
      (
        await User.readAllBlocks(2, {
          user_id: true,
          from_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    const ids = await User.readAllBlocks(2, {
      id: true,
      from_user_id: true,
    });

    const usersBlock = ids.find((blockData) => blockData.from_user_id === 3);

    await User.deleteBlock(usersBlock.id);
    expect((await User.readAllBlocks(2, { user_id: true })).length).toBe(
      ids.length - 1
    );
  });

  xit('has a get users blocks method', (): void => {
    console.log('stub');
  });

  xit('has a copy recipe method', (): void => {
    console.log('stub');
  });

  xit('has a friend request method', (): void => {
    console.log('stub');
  });

  xit('has a delete friend request method', (): void => {
    console.log('stub');
  });

  xit('has an accept friend request method', (): void => {
    console.log('stub');
  });

  xit('has a block user method', (): void => {
    console.log('stub');
  });

  xit('has an unblock user method', (): void => {
    console.log('stub');
  });

  xit('can update the profile image', (): void => {
    console.log('stub');
  });

  xit('can update the last_udate', (): void => {
    console.log('stub');
  });
});
