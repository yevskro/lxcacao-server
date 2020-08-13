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
import User, { UserData, SQLNow } from '../../src/models/User';

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
    /* if there is no error a record will be created with a new id */
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

  it('invokes an error callback and returns undefined on error', async (): Promise<
    void
  > => {
    const onError = jest.fn(); // create a mock function
    /* this should error and return undefined */
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
    /* if onError was called then houston we have a problem */
    expect(onError).toBeCalled();
  });

  it('can query customizable user data by id', async (): Promise<void> => {
    /* we are checkin that we can query by userId and using a Data interface which
      generates a query string based on what fields are true to query
    */
    const data: UserData = await User.readUserById(1, {
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
    const result = await User.readUserById(1, {
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
    /* create a mock error function, 
       update recipe with the mock function, 
       expect error not invoke which means all is well
    */
    const onError = jest.fn();
    await User.updateRecipe(1, { name: 'Bubblegum Jonie' }, onError);
    expect(onError).not.toBeCalled();
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
    const onError = jest.fn(); // mock error fn
    await User.deleteRecipe(2, onError); // a recipe with id 2 was created from src/db/seed.sql
    expect(onError).not.toBeCalled();
    /* try to read from a record that doesn't exist should return undefined */
    expect(await User.readRecipe(2, { main_user_id: true }, onError)).toBe(
      undefined
    );
  });

  it('can get all users recipe', async (): Promise<void> => {
    /* get the length of the current recipes, create a recipes, and
       make sure the length is incremented which means its reading
       the created one
    */
    const amountOfRecipes = (
      await User.readAllRecipes(1, { main_user_id: true })
    ).length;

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
    /* testing through database error, if the database didn't through
       anything on a insert query than success
    */
    const onError = jest.fn();
    await User.createFriendRequest(
      { main_user_id: 2, peer_user_id: 1 },
      onError
    );
    expect(onError).not.toBeCalled();
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

    await User.deleteFriendRequest(usersRequest.id); // deleting by the row id
    expect(
      (await User.readAllFriendRequests(2, { main_user_id: true })).length
    ).toBe(ids.length - 1);
  });

  it('can create a friend', async (): Promise<void> => {
    /* if the error function wasn't called then the database
      successfully parsed an insert query 
    */
    const onError = jest.fn();
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 }, onError);
    expect(onError).not.toBeCalled();
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

    await User.deleteFriend(usersFriend.id); // deleting by the row id
    expect((await User.readAllFriends(2, { main_user_id: true })).length).toBe(
      ids.length - 1
    );
  });

  it('can create a block', async (): Promise<void> => {
    /* if the error function method was not invoked then the insert query
      was successful 
    */
    const onError = jest.fn();
    await User.createBlock({ main_user_id: 2, peer_user_id: 1 }, onError);
    expect(onError).not.toBeCalled();
  });

  it('can read all blocks', async (): Promise<void> => {
    /* compare the length of requests with the length of requests after
      adding a block row
    */
    const ammountOfRequests = (
      await User.readAllBlocks(2, {
        main_user_id: true,
        peer_user_id: true,
      })
    ).length;

    await User.createBlock({ main_user_id: 2, peer_user_id: 3 });

    expect(
      (
        await User.readAllBlocks(2, {
          main_user_id: true,
          peer_user_id: true,
        })
      ).length
    ).toBe(ammountOfRequests + 1);
  });

  it('can delete a friend request', async (): Promise<void> => {
    /* read all blocks, delete a user block, compare the length 
     of before and after */
    const ids = await User.readAllBlocks(2, {
      id: true, // row id
      peer_user_id: true,
    });

    const usersBlock = ids.find((blockData) => blockData.peer_user_id === 3);
    // users block holds the row id and peer_user_id

    await User.deleteBlock(usersBlock.id); // delete by row id
    expect((await User.readAllBlocks(2, { main_user_id: true })).length).toBe(
      ids.length - 1
    );
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

    const result = await User.readMessageQueueById(readData[0].id, {
      message: true,
    });
    expect(result).toBe(undefined);
  });

  it('can create a chat between users', async (): Promise<void> => {
    /* create a chat row and make sure we can select it by id */
    const result = await User.createChat({ main_user_id: 1, peer_user_id: 2 });
    const queriedId = (
      await pool.query(`SELECT id FROM users_chats WHERE id = ${result.id}`)
    ).rows[0].id;
    expect(queriedId).toBe(result.id);
  });

  it('can read a chat between users', async (): Promise<void> => {
    /* read the record we created where we didn't set the messages
      so the messages will be an empty record by default
    */
    const result = await User.readChat(1, { messages: true });
    expect(result.messages).toStrictEqual([]);
  });

  it('can read all chats that a main user has', async (): Promise<void> => {
    /* create an extra chat that belongs to user_id 1 and compare that
    they are being communicated with the peer_users_id which we setup */
    await User.createChat({ main_user_id: 1, peer_user_id: 3 });
    const result = await User.readAllChatsByUserId(1, {
      peer_user_id: true,
    });
    expect(result[0].peer_user_id).toBe(2); // we created a record in a preceding test
    expect(result[1].peer_user_id).toBe(3);
  });

  it('can read messages betweeen a user and peer', async (): Promise<void> => {
    /* make sure we can find a record not by just the main user id but who
     the messages are going to */
    const result = await User.readChatByMainPeerId(1, 2, { messages: true });
    /* we are going from the records created in the preceding methods
      no messages were set so the default message would be [] 
    */
    expect(result.messages).toStrictEqual([]);
  });

  it('can update messages betweeen a user and peer by user ids', async (): Promise<
    void
  > => {
    /* up date the message from main user to peer user, then read it back and compare,
      also compare last_chat_update works properly =p
    */
    await User.updateChatByMainPeerId(1, 2, {
      messages: ['durran'],
      last_chat_update: SQLNow.query,
    });
    const readData = await User.readChatByMainPeerId(1, 2, {
      last_chat_update: true,
      messages: true,
    });
    expect(readData.last_chat_update).not.toStrictEqual('');
    expect(readData.messages).toStrictEqual(['durran']);
  });

  it('can update messages betweeen a user and peer by row id', async (): Promise<
    void
  > => {
    /* we didn't save the rows ids in our preceding methods so we're going to read back
      the ids using readChatByMainPeerId, update the record, and read back, and compare
    */
    const result = await User.readChatByMainPeerId(1, 2, { id: true });
    await User.updateChat(result.id, {
      messages: ['hey dude', 'whats up?'],
      last_chat_update: SQLNow.query,
    });
    const readData = await User.readChat(result.id, { messages: true });
    expect(readData.messages.length).toBe(2);
    expect(readData.messages[0]).toStrictEqual('hey dude');
    expect(readData.messages[1]).toStrictEqual('whats up?');
  });

  it('can delete a chat', async (): Promise<void> => {
    /* delete the first row, not able to read from an available record
      will return undefined from User.readChat
    */
    await User.deleteChat(1);
    const result = await User.readChat(1, { messages: true });
    expect(result).toBe(undefined);
  });

  it('can delete a chat by user and peer id', async (): Promise<void> => {
    /* read all main and peer ids from the chats from user_id 1,
      and delete the first chat from user id by the first main and peer id,
      try to read back from it if it's not there it should be undefined
    */
    const allChats = await User.readAllChatsByUserId(1, {
      main_user_id: true,
      peer_user_id: true,
    });

    await User.deleteChatByMainPeerId(
      allChats[0].main_user_id,
      allChats[0].peer_user_id
    );

    const chat = await User.readChat(allChats[0].id, {
      main_user_id: true,
      peer_user_id: true,
    });
    expect(chat).toBe(undefined);
  });
});
