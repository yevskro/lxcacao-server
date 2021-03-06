/*
    Author: Yevgeniy Skroznikov
    Date: August 7 2020

    Description: 
    This tests the query utility methods our server will be using
    to create/read/update/delete our resources from a User data 
    model perspective. Authorization methods are left out and will
    be implemented by server middleware. Which makes the model 
    unopinionated and leaves it up to the developer how the methods
    will be used.
    
    The database tables that are queried through the User model are:
    users
    users_recipes
    users_friends
    users_blocks
    users_requests
    users_chats
    users_messages_queue
*/

import { Pool } from 'pg';
import User, { UserData } from '../../src/models/User';
import testSetupDbHelper from '../helpers/testSetupDbHelper';

describe('users model test suite', (): void => {
  const conTestString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;

  beforeAll((): void => {
    pool = new Pool({ connectionString: conTestString });
  });

  afterAll(
    async (): Promise<void> => {
      pool.end();
      User.poolEnd();
    }
  );

  it('can clear and setup a testdb', async () =>
    expect(await testSetupDbHelper()).toBe(true));

  it('can create a user', async (): Promise<void> => {
    /* if the user is created then a id will be returned */
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
    /* if the database does not throw an 
    error a record will be created with a new id */
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
    /* double check we can select the field and it holds the proper data */
    const query = `SELECT img_file_name FROM users WHERE users.gmail = 'durran2@gmail.com'`;
    expect((await pool.query(query)).rows[0].img_file_name).toStrictEqual(
      'test.png'
    );
  });

  it('can query customizable user data by id', async (): Promise<void> => {
    /* we are checkin that we can query by userId and using a Data interface which
      generates a query string based on what fields are true to query
    */
    const data: UserData = await User.readUser(1, {
      gmail: true,
      first_name: true,
      last_name: true,
    });
    /* seed.sql in /src/db/seed.sql has created initianary rows 
      read them make sure they equal
    */
    expect(data.gmail).toStrictEqual('root@gmail.com');
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
  });

  it('can query customizable user data by gmail', async (): Promise<void> => {
    /* check if we can query by a users gmail */
    const data: UserData = await User.readUserByGmail('root@gmail.com', {
      id: true,
      first_name: true,
      last_name: true,
      img_file_name: true,
    });

    /* this row was created in src/db/seed.sql asserting on those values */
    expect(data.id).toBe(1);
    expect(data.first_name).toStrictEqual('test');
    expect(data.last_name).toStrictEqual('test');
    expect(data.img_file_name).toStrictEqual('test.png');
  });

  it('can update users data', async (): Promise<void> => {
    /* update user, reread the field, and check changes are matching */
    await User.updateUser(1, { first_name: 'Yev', last_name: 'Skro' });
    const result = await User.readUser(1, {
      first_name: true,
      last_name: true,
    });
    expect(result.first_name).toStrictEqual('Yev');
    expect(result.last_name).toStrictEqual('Skro');
  });

  it('can create a recipe that belongs to a user', async (): Promise<void> => {
    /* create a recipe and the result should be undefined if all is well */
    const result = await User.createRecipe({
      main_user_id: 1,
      name: 'Beef Straganoff',
      time: '1hr 15m',
      type: 'Dinner Entree',
      private: false,
      origin_user_id: 1,
      origin_user_full_name: 'Yev Skro',
    });
    expect(result).not.toBe(undefined);
    expect(typeof result.id).toBe('number'); // check the return value to be an id number
  });

  it('can update a users recipe', async (): Promise<void> => {
    /* expecting the database not to throw an error */
    await User.updateRecipe(1, { name: 'Bubblegum Jonie' });
  });

  it('can read a users recipe', async (): Promise<void> => {
    /* read recipe, if it's undefined something was off */
    const result = await User.readRecipe(1, { main_user_id: true });
    expect(result).not.toBe(undefined);
    /* make sure the data is synced: first recipe belongs to the 
    first user which was seeded from src/db/seed.sql */
    expect(result.main_user_id).toBe(1);
  });

  it('can delete a users recipe', async (): Promise<void> => {
    await User.deleteRecipe(2); // a recipe with id 2 was created from src/db/seed.sql
    /* try to read from a record that doesn't exist should return undefined */
    expect(await User.readRecipe(2, { main_user_id: true })).toBe(undefined);
  });

  it('can get all users recipe', async (): Promise<void> => {
    /* get the length of the current recipes, create a recipes, and
       make sure the length is incremented which means its reading
       the created one
    */
    const amountOfRecipes = (
      await User.readAllRecipes(1, { main_user_id: true })
    ).length;

    //    console.log(amountOfRecipes);

    await User.createRecipe({
      main_user_id: 1,
      name: 'Banana Icecream Pants',
      time: '1hr',
      type: 'Desert',
      private: false,
      origin_user_id: 1,
      origin_user_full_name: 'Yev Skro',
    });

    expect((await User.readAllRecipes(1, { main_user_id: true })).length).toBe(
      amountOfRecipes + 1
    );
  });

  it('can create a friend request', async (): Promise<void> => {
    /* if the database didn't throw error
       anything on a insert query than success
    */
    await User.createFriendRequest({ main_user_id: 2, peer_user_id: 1 });
  });

  it('can read all friend requests', async (): Promise<void> => {
    /* compare the length of all new friend requests 
       before and after a new friend request was created
    */
    const ammountOfRequests = (
      await User.readAllFriendRequests(2, {
        main_user_id: true,
        peer_user_id: true,
      })
    ).length;

    await User.createFriendRequest({ main_user_id: 2, peer_user_id: 3 });

    expect(
      (
        await User.readAllFriendRequests(2, {
          main_user_id: true,
          peer_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    /* read all friend requests with the id's find the 
      one want to delete and then read from all the friend 
      requests and compare if its still there
    */
    const ids = await User.readAllFriendRequests(2, {
      id: true, // getting the row id
      peer_user_id: true,
    });

    const usersRequest = ids.find(
      (requestData) => requestData.peer_user_id === 3
    ); // will return the row id and the peer_user_id

    await User.deleteFriendRequestByRowId(usersRequest.id); // deleting by the row id
    expect(
      (await User.readAllFriendRequests(2, { main_user_id: true })).length
    ).toBe(ids.length - 1);
  });

  it('can create a friend', async (): Promise<void> => {
    /* if no error is thronw function then the database
      successfully parsed an insert query 
    */
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });
  });

  it('can read all friend requests', async (): Promise<void> => {
    /* compare the length of friends requests with the length
      of friend requests after a new friend request was created 
    */
    const ammountOfRequests = (
      await User.readAllFriends(2, {
        main_user_id: true,
        peer_user_id: true,
      })
    ).length;

    await User.createFriend({ main_user_id: 2, peer_user_id: 3 });

    expect(
      (
        await User.readAllFriends(2, {
          main_user_id: true,
          peer_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    /* read all friends, find a friend, delete a friend by the row id,
    compare the lengths from before and after */
    const ids = await User.readAllFriends(2, {
      id: true, // get the id of the row
      peer_user_id: true,
    });

    /* find the friend with the peer_user_id */
    const usersFriend = ids.find((friendData) => friendData.peer_user_id === 3);
    // userFriend holds the row id and the peer_user_id

    await User.deleteFriendByRowId(usersFriend.id); // deleting by the row id
    expect((await User.readAllFriends(2, { main_user_id: true })).length).toBe(
      ids.length - 1
    );
  });

  it('can create a block', async (): Promise<void> => {
    /* if no error was thrown method was not invoked then the insert query
      was successful 
    */
    await User.createBlock({ main_user_id: 1, peer_user_id: 1 });
  });

  it('can read all blocks', async (): Promise<void> => {
    /* compare the length of requests with the length of requests after
      adding a block row
    */
    const ammountOfBlocks = (
      await User.readAllBlocksByMainUserId(2, {
        peer_user_id: true,
      })
    ).length;

    await User.createBlock({ main_user_id: 2, peer_user_id: 3 });

    expect(
      (
        await User.readAllBlocksByMainUserId(2, {
          peer_user_id: true,
        })
      ).length
    ).toBe(ammountOfBlocks + 1);
  });

  it('can delete a block', async (): Promise<void> => {
    /* read all blocks, delete a user block, compare the length 
     of before and after */
    const ids = await User.readAllBlocksByMainUserId(2, {
      id: true, // row id
      peer_user_id: true,
    });

    const usersBlock = ids.find((blockData) => blockData.peer_user_id === 3);
    // users block holds the row id and peer_user_id

    await User.deleteBlockByRowId(usersBlock.id); // delete by row id
    expect(
      (await User.readAllBlocksByMainUserId(2, { peer_user_id: true })).length
    ).toBe(ids.length - 1);
  });

  it('can create and add message to message queue', async (): Promise<void> => {
    const idData = await User.createMessageQueue({
      // invokes insert query
      message: 'hi',
      main_user_id: 1,
      peer_user_id: 2,
    });
    /* if not undefined then we should have a valid new id returned in idData */
    expect(idData).not.toBe(undefined);
    const query = `SELECT message FROM users_messages_queue WHERE id = ${idData.id};`;
    /* read back the data */
    const result = (await pool.query(query)).rows[0];
    /* make sure the data that we wanted to be saved is in sync */
    expect(result.message).toStrictEqual('hi');
  });

  it('can read message from message queue', async (): Promise<void> => {
    /* we created a message in the preceding test. we will read
    it this time using our method and compare */
    const result = await User.readAllMessagesQueueByMainUserId(1, {
      message: true,
    });
    expect(result[0].message).toStrictEqual('hi');
  });

  it('can delete message from message queue', async (): Promise<void> => {
    /* read all messages delete the first one, read all the messages back
    and make sure the first is not the same from before */
    const readData = await User.readAllMessagesQueueByMainUserId(1, {
      id: true,
    });

    await User.deleteMessageQueue(readData[0].id);

    const result = await User.readMessageQueue(readData[0].id, {
      message: true,
    });
    expect(result).toBe(undefined);
  });

  it('can check if a user owns a recipe', async (): Promise<void> => {
    /* db/src/seed.sql has created references from the first user to the 
      first recipe, therefore the user with the first id does have
      a recipe with the row id of 1 and it should be returning true
    */
    expect(await User.isOwnerOfRecipe(1, 1)).toBe(true);
  });

  it('can check if a user is a friend of another peer', async (): Promise<
    void
  > => {
    /* from the previous tests user at main_user_id 2 is friends with
      peer_user_id 1, we expect the user to be friends with the peer
    */
    expect(await User.isFriendsWith(2, 1)).toBe(true);
  });

  it('can check if a user is blocked by another peer', async (): Promise<
    void
  > => {
    await User.createBlock({ main_user_id: 1, peer_user_id: 2 });
    expect(await User.isBlockedBy(1, 2)).toBe(true);
  });

  it('can update the last cache and return the time', async (): Promise<
    void
  > => {
    const data = await User.readUserByGmail('root@gmail.com', {
      id: true,
      last_cache_update: true,
    });
    const newCache = (await User.updateLastCacheUpdateByUserRowId(data.id))
      .last_cache_update;
    expect(newCache).not.toBe(undefined);
    expect(newCache).not.toStrictEqual(data.last_cache_update);
  });
});
