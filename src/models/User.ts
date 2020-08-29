/* eslint-disable camelcase */
/* camelCase have been disabled because sql names are snake cased */
/**
 * Author: Yevgeniy Skroznikov
 * Date: August 13 2020
 * Description:
 * This tests the query utility methods our server will be using
 * to create/read/update/delete our resources from a User data
 * model perspective. Authorization methods are left out and will
 * be implemented by server middleware. Which makes the model
 * unopinionated and leaves it up to the developer how the methods
 * will be used.
 *
 * The database tables that are queried through the User model are:
 * users
 * users_recipes
 * users_friends
 * users_blocks
 * users_requests
 * users_chats
 * users_messages_queue
 *
 * There are helper methods that generate a query string based on
 * the type of query and values based on parametized values to secure
 * from sql injections.
 */

import { Pool, QueryResultRow } from 'pg';

type Field = string; // a sql field, such as id, name, gmail.. etc..
type FieldPlaceholder = string; // used for update queries such as 'id = ($1)'
type Placeholder = string; // a placeholder in queries such as $1
type Param = string | number | boolean; // parameter that will replace the placeholder in sql queries
type Query = string; // dynamically generated query
type SQLTimeStamp = string; // sql timestamp type
type NothingFound = undefined; // used for read queries
type NothingCreated = undefined; // used for create queries

export enum SQLNow { // enum for NOW() query used in create data for time stamps
  query = 'NOW()',
}

export interface AllReadData {
  all?: boolean;
}

export interface IdData {
  // an object returned from create queries
  id?: number;
}

export interface UpdateChatData {
  // data thats able to be updated for users_chats
  messages: string[];
  last_chat_update: SQLNow;
}

export interface CreateChatData extends CreateMainPeerData {
  // data that needed to create a row for users_chats
  messages?: string[];
  last_chat_update?: SQLNow;
}

export interface ReadChatData extends ReadMainPeerData {
  // data is readable from users_chats table
  messages?: boolean;
  last_chat_update?: boolean;
}

export interface ChatData extends MainPeerData {
  // data that can accessed from users_chats
  messages?: string[];
  last_chat_update?: SQLTimeStamp;
}
export interface CreateMessageData extends CreateMainPeerData {
  // data that mandatory to create a row in users_message_queue
  message: string;
}

export interface ReadMessageData extends ReadMainPeerData {
  // data that is readable from a users_message_queue row
  message?: boolean;
  all?: boolean;
}
export interface MessageData extends MainPeerData {
  // data that can be accessed from a users_message_queue row
  message?: string;
}
export interface CreateMainPeerData {
  // data that is mandatory to create a row in tables that support
  // these fields
  main_user_id: number;
  peer_user_id: number;
}

export interface MainPeerData {
  // data that can be accessed from a row in tables
  // that support these fields
  id?: number;
  main_user_id?: number;
  peer_user_id?: number;
  create_date?: SQLTimeStamp;
}

export interface ReadMainPeerData {
  // data that can be read from tables that support these fields
  id?: boolean;
  main_user_id?: boolean;
  peer_user_id?: boolean;
  create_date?: boolean;
  all?: boolean;
}

export interface CreateUserData {
  // data that is mandatory to create a row in users table
  gmail: string;
  first_name: string;
  last_name: string;
  login_ip: string;
  secure_key: string;
  img_file_name?: string; // file name of the users profile image
}

export interface UserData {
  // data that can be accessed from a row in users table
  id?: number;
  gmail?: string;
  first_name?: string;
  last_name?: string;
  login_ip?: string;
  secure_key?: string;
  img_file_name?: string; // file name of the users profile image
  last_update?: SQLTimeStamp;
  create_date?: SQLTimeStamp;
}

export interface ReadUserData {
  // data that can be read from a row in users table
  id?: boolean;
  gmail?: boolean;
  first_name?: boolean;
  last_name?: boolean;
  login_ip?: boolean;
  secure_key?: boolean;
  img_file_name?: boolean;
  last_update?: boolean;
  create_date?: boolean;
  all?: boolean;
}

export interface UpdateUserData {
  // data that can be updated in a row in users table
  first_name?: string;
  last_name?: string;
  login_ip?: string;
  secure_key?: string;
  img_file_name?: string; // file name of the users profile image
  last_update?: SQLNow;
}

export interface CreateRecipeData {
  // data that is mandatory to create a row in recipes table
  name: string;
  time: string;
  type: string;
  private: boolean;
  main_user_id: number;
  origin_user_id: number;
  origin_user_full_name: string;
  ingredients?: string[];
  how_to_prepare?: string[];
  img_file_name?: string;
}

export interface ReadRecipeData {
  // data that can be read from a row in recipes table
  id?: boolean;
  name?: boolean;
  time?: boolean;
  type?: boolean;
  private?: boolean;
  ingredients?: boolean;
  how_to_prepare?: boolean;
  main_user_id?: boolean;
  origin_user_id?: boolean;
  origin_user_full_name?: boolean;
  img_file_name?: boolean;
  create_date?: boolean;
  all?: boolean;
}

export interface RecipeData {
  // data that can be accessed from recipes table
  id?: number;
  name?: string;
  time?: string;
  type?: string;
  private?: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  main_user_id?: number;
  origin_user_id?: number;
  origin_user_full_name?: string;
  img_file_name?: string;
  create_date?: SQLTimeStamp;
}

export interface UpdateRecipeData {
  // data that can be updated in recipes table
  name?: string;
  time?: string;
  type?: string;
  private?: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  img_file_name?: string;
}

let conString = '';
if (process.env.NODE_ENV === 'test') {
  conString = 'postgres://postgres@127.0.0.1:5432/testdb';
} else conString = 'postgres://postgres@db:5432/testdb';

class User {
  public static pool = new Pool({
    connectionString: conString,
  });

  /* * * * * * Utility Methods * * * * * */
  static async setPool(conUrl: string): Promise<void> {
    await User.pool.end(); // end the current connection before resetting
    User.pool = new Pool({
      connectionString: conUrl,
    });
  }

  static async poolEnd(): Promise<void> {
    /* end the connection pool to postgresql db */
    await User.pool.end();
  }

  private static genFieldsFromData(
    queryData:
      | ReadRecipeData
      | ReadUserData
      | ReadMainPeerData
      | ReadMessageData
      | UserData
      | RecipeData
      | MainPeerData
      | MessageData
      | ChatData
  ): Field[] {
    /* this is a helper method that helps build out a sql query 
      it will generate an array of all field names from the query data
      and be returned where the developer can join it with commas
      or do something else that is more appropriate for the query case
    */
    if ((queryData as AllReadData).all) return ['*']; // account for read interfaces with the all flag

    const fields: Field[] = [];
    const keys = Object.keys(queryData);
    keys.forEach((key) => {
      fields.push(key);
    });
    return fields;
  }

  private static genPlaceholdersFromFieldsLength(len: number): Placeholder[] {
    /* this will generate an array of place holders for parametized queries
      to prevent sql injections. i.e INSERT INTO ... VALUES ($1, $2, $3) 
      how many are based of how many fields will be supposebly inserted into.
    */
    const placeholders: Placeholder[] = [];
    for (let i = 1; i <= len; i += 1) {
      placeholders.push(`$${i}`);
    }
    return placeholders;
  }

  private static genFieldPlaceholdersAndParamsFromData(
    data: RecipeData | UserData | MainPeerData | MessageData | ChatData
  ): [FieldPlaceholder[], Param[]] {
    const params: Param[] = [];
    const fieldsPlaceholders: FieldPlaceholder[] = [];
    /* loop through the data and split a part
    the key and value. push the key and place holder (index) in a string
    and the value in the params that will be used to generate a query */
    Object.entries(data).forEach((keyValuePair, idx) => {
      /* keyValuePair ex.
        keyValuePair[0] = 'id', keyValuePair[1] = '2' 
        fieldsPlaceholders[0] = 'id = $(1)'
        params[0] = 2
      */
      fieldsPlaceholders.push(`${keyValuePair[0]} = ($${idx + 1})`);
      params.push(keyValuePair[1]);
    });
    return [fieldsPlaceholders, params];
  }

  private static genFieldsAndParamsFromData(
    data: RecipeData | UserData | MainPeerData | MessageData | ChatData
  ): [Field[], Param[]] {
    /* read the key and value of the user data and split them up
      the key will go into the fields and the value will go into
      the params. those variables then are used to help generate
      a query.
    */
    const params: Param[] = [];
    const fields: Field[] = [];
    Object.entries(data).forEach((keyValuePair) => {
      fields.push(keyValuePair[0]);
      params.push(keyValuePair[1]);
    });
    return [fields, params];
  }

  private static genCreateQueryAndParams(
    tableName: string,
    createData:
      | CreateRecipeData
      | CreateUserData
      | CreateMainPeerData
      | CreateMessageData
      | CreateChatData
  ): [Query, Param[]] {
    /* this method helps to dynamically generate a query based
      on  the table name, and the data to be queried
    */
    const [fields, params]: [
      Field[],
      Param[]
    ] = User.genFieldsAndParamsFromData(createData); // generate fields and params
    const placeHolders: Placeholder[] = User.genPlaceholdersFromFieldsLength(
      fields.length
    ); // generate placeholders i.e ($1, $2, $3)
    /* when generate the full query we: 
       combine the fields with a comma for valid sql syntax,
       combine the placeholders with a comma for valid sql syntax
       and then return that query that has been parametized
       with the params as the second element in the array.(tuple)
    */
    const query: Query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES
    (${placeHolders.join(', ')}) RETURNING id;`;
    return [query, params];
  }

  private static genReadQueryAndParamsByIdOrGmail(
    id: number | null,
    tableName: string,
    readData: ReadRecipeData | ReadUserData | ReadMessageData,
    gmail?: string
  ): [Query, Param[]] {
    /* use case is that we might have to read a user by a gmail
      so the option is avaiable if needed 
    */
    if (id === null && gmail === undefined)
      throw Error('id or gmail must be set');

    let condition;
    let param;
    let query = '';

    /* setup our condition and param */
    if (id === null) {
      condition = 'gmail = ($1)';
      param = gmail;
    } else {
      condition = 'id = ($1)';
      param = id;
    }

    /* generate the query */
    if (readData.all) {
      query = `SELECT * FROM ${tableName} WHERE ${condition};`;
    } else {
      query = 'SELECT ';
      query += `${User.genFieldsFromData(
        readData
      )} FROM ${tableName} WHERE ${condition};`;
    }

    return [query, [param]];
  }

  private static genUpdateQueryAndParamsById(
    id: number,
    tableName: string,
    updateData: UpdateRecipeData | UpdateUserData | UpdateChatData
  ): [Query, Param[]] {
    /* when we use an update query the way we query our fields is a bit
      different such as SET name = '232', so here we need to generate
      field placeholders('name = ($1)') instead of ordinary fields and 
      placeholders such as an insert value query.
    */
    const [fields, params] = this.genFieldPlaceholdersAndParamsFromData(
      updateData
    );
    /* combine fields, params, and the id that was passed to generate
    a query and params */
    const query = `
    UPDATE ${tableName}
    SET ${fields.join(', ')}
    WHERE id = ($${params.length + 1});`;

    return [query, [...params, id]];
  }

  private static async query(
    query: Query,
    params: Param[]
  ): Promise<QueryResultRow[]> {
    /* this query is a wrapper around the pool query to return the rows */
    return (await User.pool.query(query, [...params])).rows;
  }

  /* * * * * * * * * * * * * * * * * * * * * */

  static async create(
    createData: CreateUserData
  ): Promise<IdData | NothingCreated> {
    /* create a user row in the users table */
    const [query, params] = User.genCreateQueryAndParams('users', createData);
    /* a sql query will return a query result of rows if we are not expecting
    for multiple rows than the result will still be in the array at the first index */
    return (await User.query(query, params))[0];
  }

  static async readUser(
    userRowId: number,
    readData: ReadUserData
  ): Promise<UserData | NothingFound> {
    /* read users from users_table by the row id */
    const [query, values] = User.genReadQueryAndParamsByIdOrGmail(
      userRowId,
      'users',
      readData
    );
    /* a sql query will return a query result of rows if we are not expecting
    for multiple rows than the result will still be in the array at the first index */
    return (await User.query(query, values))[0];
  }

  static async readUserByGmail(
    gmail: string,
    readData: ReadUserData
  ): Promise<UserData | NothingFound> {
    /* read from users table by gmail */
    const [query, values] = User.genReadQueryAndParamsByIdOrGmail(
      null,
      'users',
      readData,
      gmail
    );

    /* a sql query will return a query result of rows if we are not expecting
    for multiple rows than the result will still be in the array at the first index */
    return (await User.query(query, values))[0];
  }

  static async updateUser(
    userRowId: number,
    updateData: UpdateUserData
  ): Promise<undefined> {
    const [query, values] = this.genUpdateQueryAndParamsById(
      userRowId,
      'users',
      updateData
    );
    await User.query(query, values);
    return undefined;
  }

  static async createRecipe(
    createData: CreateRecipeData
  ): Promise<IdData | NothingCreated> {
    const [query, values] = this.genCreateQueryAndParams('recipes', createData);
    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, values))[0];
  }

  static async readRecipe(
    recipeRowId: number,
    readData: ReadRecipeData
  ): Promise<RecipeData | NothingFound> {
    /* reads the recipe from a database */
    const [query, values] = this.genReadQueryAndParamsByIdOrGmail(
      recipeRowId,
      'recipes',
      readData
    );
    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, values))[0];
  }

  static async updateRecipe(
    recipeRowId: number,
    updateData: UpdateRecipeData
  ): Promise<undefined> {
    /* updates the recipe in the sql database */
    const [query, values] = this.genUpdateQueryAndParamsById(
      recipeRowId,
      'recipes',
      updateData
    );
    await User.query(query, values);
    return undefined;
  }

  static async deleteRecipe(recipeRowId: number): Promise<undefined> {
    /* delete a recipe from postgresql database */
    const query = `DELETE FROM recipes WHERE id = ($1);`;
    await User.query(query, [recipeRowId]);
    return undefined;
  }

  static async readAllRecipes(
    mainUserId: number,
    readData: ReadRecipeData
  ): Promise<RecipeData[] | NothingFound> {
    /* reads all recipes from the postgresql db that belong to a user id */
    const query = `SELECT ${User.genFieldsFromData(readData).join(
      ', '
    )} FROM recipes WHERE main_user_id = ($1);`;
    return User.query(query, [mainUserId]);
  }

  static async createFriendRequest(
    createData: CreateMainPeerData
  ): Promise<IdData | NothingCreated> {
    /* create a friend request if it fails undefined is returned */
    const [query, values] = User.genCreateQueryAndParams(
      'users_requests',
      createData
    );
    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, values))[0];
  }

  static async readAllFriendRequests(
    mainUserId: number,
    readData: ReadMainPeerData
  ): Promise<MainPeerData[] | NothingFound> {
    /* read all friend requests that belong to a user. (main_user_id) 
      returns undefined is nothing found
    */
    const query = `SELECT ${User.genFieldsFromData(readData).join(', ')} FROM 
    users_requests WHERE main_user_id = ($1)`;

    return User.query(query, [mainUserId]);
  }

  static async deleteFriendRequestByRowId(
    usersRequestsRowId: number
  ): Promise<undefined> {
    /* delete friend request from the friend_requests table in the postgresql db */
    const query = 'DELETE FROM users_requests WHERE id = ($1)';
    await User.query(query, [usersRequestsRowId]);
    return undefined;
  }

  static async deleteFriendRequestByMainPeerId(
    mainUserId: number,
    peerUserId: number
  ): Promise<undefined> {
    /* delete friend request from the friend_requests table in the postgresql db */
    const query =
      'DELETE FROM users_requests WHERE main_user_id = ($1) AND peer_user_id = ($2)';
    await User.query(query, [mainUserId, peerUserId]);
    return undefined;
  }

  static async createFriend(
    createData: CreateMainPeerData
  ): Promise<IdData | NothingCreated> {
    /* create a row in users_friends in the postgresql db */
    const [query, values] = User.genCreateQueryAndParams(
      'users_friends',
      createData
    );
    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, values))[0];
  }

  static async readAllFriends(
    mainUserId: number,
    readData: ReadMainPeerData
  ): Promise<MainPeerData[] | NothingFound> {
    /* read all friends that belong to a user. (main_user_id)
      undefined if nothing is found
    */
    const query = `SELECT ${User.genFieldsFromData(readData).join(
      ', '
    )} FROM users_friends WHERE main_user_id = ($1);`;
    return User.query(query, [mainUserId]);
  }

  static async deleteFriendByRowId(
    usersFriendsRowId: number
  ): Promise<undefined> {
    /* deletes a friend from users_friends table from the psql db */
    const query = 'DELETE FROM users_friends WHERE id = ($1)';
    await User.query(query, [usersFriendsRowId]);
    return undefined;
  }

  static async deleteFriendByMainPeerId(
    main_user_id: number,
    peer_user_id: number
  ): Promise<undefined> {
    /* deletes a friend from users_friends table from the psql db */
    const query =
      'DELETE FROM users_friends WHERE main_user_id = ($1) AND peer_user_id = ($2)';
    await User.query(query, [main_user_id, peer_user_id]);
    return undefined;
  }

  static async createBlock(
    createData: CreateMainPeerData
  ): Promise<IdData | NothingCreated> {
    /* create users_blocks main_user_id blocks the peer_user_id */
    const [query, values] = User.genCreateQueryAndParams(
      'users_blocks',
      createData
    );

    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, values))[0];
  }

  static async readAllBlocksByMainUserId(
    mainUserId: number,
    readData: ReadMainPeerData
  ): Promise<MainPeerData[] | NothingFound> {
    /* read all blocks a user has given */
    const query = `SELECT ${User.genFieldsFromData(readData).join(
      ', '
    )} FROM users_blocks WHERE main_user_id = ($1)`;
    return User.query(query, [mainUserId]);
  }

  static async readAllBlocksByPeerUserId(
    peerUserId: number,
    readData: ReadMainPeerData
  ): Promise<MainPeerData[] | NothingFound> {
    /* read all blocks a user has received */
    const query = `SELECT ${User.genFieldsFromData(readData).join(
      ', '
    )} FROM users_blocks WHERE peer_user_id = ($1)`;
    return User.query(query, [peerUserId]);
  }

  static async deleteBlockByRowId(
    usersBlocksRowId: number
  ): Promise<undefined> {
    /* delete a block from the users_blocks table from the postgresql db */
    const query = 'DELETE FROM users_blocks WHERE id = ($1)';
    await User.query(query, [usersBlocksRowId]);
    return undefined;
  }

  static async deleteBlockByMainPeerId(
    main_user_id: number,
    peer_user_id: number
  ): Promise<undefined> {
    /* delete a block from the users_blocks table from the postgresql db */
    const query =
      'DELETE FROM users_blocks WHERE main_user_id = ($1) AND peer_user_id = ($2)';
    await User.query(query, [main_user_id, peer_user_id]);
    return undefined;
  }

  static async createMessageQueue(
    createData: CreateMessageData
  ): Promise<IdData | NothingCreated> {
    /* create a message on the users_message_queue table */
    const [query, params] = this.genCreateQueryAndParams(
      'users_messages_queue',
      createData
    );

    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, params))[0];
  }

  static async deleteMessageQueue(messageRowId: number): Promise<undefined> {
    /* delete a row from the users_message_queue table */
    const query = 'DELETE FROM users_messages_queue WHERE id = ($1)';
    await User.query(query, [messageRowId]);
    return undefined;
  }

  static async deleteAllMessageQueueByMainUserId(
    mainUserId: number
  ): Promise<undefined> {
    /* delete a row from the users_message_queue table */
    const query = 'DELETE FROM users_messages_queue WHERE main_user_id = ($1)';
    await User.query(query, [mainUserId]);
    return undefined;
  }

  static async deleteAllMessageQueueByPeerUserId(
    peerUserId: number
  ): Promise<undefined> {
    /* delete a row from the users_message_queue table */
    const query = 'DELETE FROM users_messages_queue WHERE peer_user_id = ($1)';
    await User.query(query, [peerUserId]);
    return undefined;
  }

  static async readAllMessagesQueueByMainUserId(
    mainUserId: number,
    readData: ReadMessageData
  ): Promise<MessageData[] | NothingFound> {
    /* read all messages that are in queue from the sender */
    const query = `SELECT ${User.genFieldsFromData(readData).join(', ')} FROM 
    users_messages_queue WHERE main_user_id = ($1);`;
    return User.query(query, [mainUserId]);
  }

  static async readAllMessagesQueueByPeerUserId(
    peerUserId: number,
    readData: ReadMessageData
  ): Promise<MessageData[] | NothingFound> {
    /* read all messages that are in queue for the reciever */
    const query = `SELECT ${User.genFieldsFromData(readData).join(', ')} FROM 
    users_messages_queue WHERE peer_user_id = ($1);`;
    return User.query(query, [peerUserId]);
  }

  static async readMessageQueue(
    messageRowId: number,
    readData: ReadMessageData
  ): Promise<MessageData | NothingFound> {
    /* read users_message_queue by the row id */
    const [query, params] = User.genReadQueryAndParamsByIdOrGmail(
      messageRowId,
      'users_messages_queue',
      readData
    );

    /* a sql query will return a query result of rows if we are not expecting
    multiple rows than the result will still be an array, we have to look at the 
    first index */
    return (await User.query(query, params))[0];
  }

  /* * Authorization Utility Methods * */

  static async isOwnerOfRecipe(
    userId: number,
    recipeRowId: number
  ): Promise<boolean> {
    /* returns true if the recipe refers to the user id in the main_user_id field
      else it doesn't belong to the user and returns false 
    */
    const data = await User.readRecipe(recipeRowId, {
      main_user_id: true,
    });

    if (data && data.main_user_id === userId) return true;
    return false;
  }

  static async isFriendsWith(
    mainUserId: number,
    peerUserId: number
  ): Promise<boolean> {
    /* if a main_user_id and peer_user_id record match a record then user is friends
    with the peer and we return true, else if no record is found return false */
    const query = `SELECT id FROM users_friends WHERE main_user_id = ($1) AND peer_user_id = ($2);`;
    const data = await User.query(query, [mainUserId, peerUserId]);

    if (data && data.length !== 0) return true;
    return false;
  }

  static async hasFriendRequest(
    mainUserId: number,
    peerUserId: number
  ): Promise<boolean> {
    const query =
      'SELECT main_user_id FROM users_requests WHERE main_user_id = ($1) AND peer_user_id = ($2);';
    const data = await User.query(query, [mainUserId, peerUserId]);

    if (data && data.length !== 0) return true;
    return false;
  }

  static async isBlockedBy(
    mainUserId: number,
    peerUserId: number
  ): Promise<boolean> {
    /* find  matching row where the the main_user_id is blocking the peer_user_id
      if found return true if non found return false 
    */
    const query = `SELECT id FROM users_blocks WHERE main_user_id = ($1) AND peer_user_id = ($2);`;
    const data = await User.query(query, [mainUserId, peerUserId]);

    if (data && data.length !== 0) return true;
    return false;
  }

  static async isAuthorized(
    mainUserId: number,
    peerUserId: number
  ): Promise<boolean> {
    if (mainUserId === peerUserId) return true;

    const isBlockedBy = await User.isBlockedBy(mainUserId, peerUserId);
    if (isBlockedBy) return false;

    const isBlocked = await User.isBlockedBy(peerUserId, mainUserId);
    if (isBlocked) return false;

    const isFriends = await User.isFriendsWith(mainUserId, peerUserId);
    if (!isFriends) return false;

    return true;
  }
  /* * * * * * * * * * * * * * * * * * */
}

export default User;
