/* eslint-disable camelcase */
import { Pool, QueryResultRow } from 'pg';

type Fields = string[];
type FieldParams = string[];
type Params = string[];
type Values = (string | number | boolean)[];
type Query = string;

interface IdData {
  id?: number;
}

export interface CreateFromToData {
  from_id: number;
  to_id: number;
}

export interface FromToData {
  from_id: number;
  to_id: number;
}

export interface ReadFromToData {
  from_id?: boolean;
  to_id?: boolean;
}

export interface CreateUserData {
  gmail: string;
  first_name: string;
  last_name: string;
  login_ip: string;
  secure_key: string;
  img_file_name?: string; // file name of the users profile image
}

export interface UserData {
  id?: number;
  gmail?: string;
  first_name?: string;
  last_name?: string;
  login_ip?: string;
  secure_key?: string;
  img_file_name?: string; // file name of the users profile image
  last_update?: string;
  create_date?: string;
}

export interface ReadUserData {
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
  first_name?: string;
  last_name?: string;
  login_ip?: string;
  secure_key?: string;
  img_file_name?: string; // file name of the users profile image
  last_update?: string;
}

interface CreateRecipeData {
  name: string;
  time: string;
  type: string;
  private: boolean;
  user_id: number;
  origin_user_id: number;
  origin_user_full_name: string;
  ingredients?: string[];
  how_to_prepare?: string[];
  img_file_name?: string;
}

interface ReadRecipeData {
  id?: boolean;
  name?: boolean;
  time?: boolean;
  type?: boolean;
  private?: boolean;
  ingredients?: boolean;
  how_to_prepare?: boolean;
  origin_user_id?: boolean;
  origin_user_full_name?: boolean;
  user_id?: boolean;
  img_file_name?: boolean;
  create_date?: boolean;
  all?: boolean;
}

interface RecipeData {
  id?: number;
  name?: string;
  time?: string;
  type?: string;
  private?: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  origin_user_id?: number;
  origin_user_full_name?: string;
  user_id?: number;
  img_file_name?: string;
  create_date?: string;
}

interface UpdateRecipeData {
  name?: string;
  time?: string;
  type?: string;
  private?: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  img_file_name?: string;
}

class User {
  private static pool = new Pool({
    connectionString: 'postgres://postgres@127.0.0.1:5432/testdb',
  });

  /* * * * * * Utility Methods * * * * * */
  static async setPool(conUrl: string): Promise<void> {
    await User.pool.end();
    User.pool = new Pool({
      connectionString: conUrl,
    });
  }

  static async poolEnd(): Promise<void> {
    await User.pool.end();
  }

  private static genFieldsFromData(
    queryData:
      | ReadRecipeData
      | ReadUserData
      | ReadFromToData
      | UserData
      | RecipeData
      | FromToData
  ): Fields {
    const fields: string[] = [];
    const keys = Object.keys(queryData);
    keys.forEach((key) => {
      fields.push(key);
    });
    return fields;
  }

  private static genParamsFromFieldsLength(len: number): Params {
    const params: Params = [];
    for (let i = 1; i <= len; i += 1) {
      params.push(`$${i}`);
    }
    return params;
  }

  private static genFieldParamsAndValuesFromData(
    data: RecipeData | UserData | FromToData
  ): [FieldParams, Values] {
    const values: Values = [];
    const fieldParams: FieldParams = [];
    Object.entries(data).forEach((keyValuePair, idx) => {
      fieldParams.push(`${keyValuePair[0]} = ($${idx + 1})`);
      values.push(keyValuePair[1]);
    });
    return [fieldParams, values];
  }

  private static genFieldsAndValuesFromData(
    data: RecipeData | UserData | FromToData
  ): [Fields, Values] {
    const values: Values = [];
    const fields: Fields = [];
    Object.entries(data).forEach((keyValuePair) => {
      fields.push(keyValuePair[0]);
      values.push(keyValuePair[1]);
    });
    return [fields, values];
  }

  private static genCreateQueryAndValues(
    tableName: string,
    createData: CreateRecipeData | CreateUserData | CreateFromToData
  ): [Query, Values] {
    const [fields, values]: [Fields, Values] = User.genFieldsAndValuesFromData(
      createData
    );
    const params: Params = User.genParamsFromFieldsLength(fields.length);
    const query: Query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES
    (${params.join(', ')}) RETURNING id;`;
    return [query, values];
  }

  private static genReadQueryAndValuesByIdOrGmail(
    id: number | null,
    tableName: string,
    readData: ReadRecipeData | ReadUserData,
    gmail?: string
  ): [Query, Values] {
    if (id === null && gmail === undefined)
      throw Error('id or gmail must be set');

    let condition;
    let value;
    let query = '';

    if (id === null) {
      condition = 'gmail = ($1)';
      value = gmail;
    } else {
      condition = 'id = ($1)';
      value = id;
    }
    if (readData.all) {
      query = `SELECT * FROM ${tableName} WHERE ${condition};`;
    } else {
      query = 'SELECT ';
      query += `${User.genFieldsFromData(
        readData
      )} FROM ${tableName} WHERE ${condition};`;
    }
    return [query, [value]];
  }

  private static genUpdateQueryAndValuesById(
    id: number,
    tableName: string,
    updateData: UpdateRecipeData | UpdateUserData
  ): [Query, Values] {
    const [fieldParams, values] = this.genFieldParamsAndValuesFromData(
      updateData
    );
    const query = `
    UPDATE ${tableName}
    SET ${fieldParams.join(', ')}
    WHERE id = ($${values.length + 1})
    ;`;

    return [query, [...values, id]];
  }

  private static async query(
    query: Query,
    values: Values,
    onError?: (err: Error) => void
  ): Promise<QueryResultRow[]> {
    try {
      return (await User.pool.query(query, [...values])).rows;
    } catch (err) {
      if (onError) onError(err);
    }
    return [];
  }

  /* * * * * * * * * * * * * * * * * * * * * */

  static async create(
    createData: CreateUserData,
    onError?: (err: Error) => void
  ): Promise<IdData | undefined> {
    const [query, values] = User.genCreateQueryAndValues('users', createData);
    return (await User.query(query, values, onError))[0];
  }

  static async readUserById(
    id: number,
    readData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData | undefined> {
    const [query, values] = User.genReadQueryAndValuesByIdOrGmail(
      id,
      'users',
      readData
    );
    return (await User.query(query, values, onError))[0];
  }

  static async readUserByGmail(
    gmail: string,
    readData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData | undefined> {
    const [query, values] = User.genReadQueryAndValuesByIdOrGmail(
      null,
      'users',
      readData,
      gmail
    );

    return (await User.query(query, values, onError))[0];
  }

  static async updateUser(
    id: number,
    updateData: UpdateUserData,
    onError?: (err: Error) => void
  ): Promise<undefined> {
    const [query, values] = this.genUpdateQueryAndValuesById(
      id,
      'users',
      updateData
    );
    await User.query(query, values, onError);
    return undefined;
  }

  static async createRecipe(
    createData: CreateRecipeData,
    onError?: (err: Error) => void
  ): Promise<IdData | undefined> {
    const [query, values] = this.genCreateQueryAndValues('recipes', createData);
    return (await User.query(query, values, onError))[0];
  }

  static async readRecipe(
    id: number,
    readData: ReadRecipeData,
    onError?: (err: Error) => void
  ): Promise<RecipeData | undefined> {
    const [query, values] = this.genReadQueryAndValuesByIdOrGmail(
      id,
      'recipes',
      readData
    );
    return (await User.query(query, values, onError))[0];
  }

  static async updateRecipe(
    id: number,
    updateData: UpdateRecipeData,
    onError?: (err: Error) => void
  ): Promise<undefined> {
    const [query, values] = this.genUpdateQueryAndValuesById(
      id,
      'recipes',
      updateData
    );
    await User.query(query, values, onError);
    return undefined;
  }

  static async deleteRecipe(
    id: number,
    onError?: (err: Error) => void
  ): Promise<undefined> {
    const query = `DELETE FROM recipes WHERE id = ($1);`;
    await User.query(query, [id], onError);
    return undefined;
  }

  static async readAllRecipes(
    userId: number,
    readData: ReadRecipeData,
    onError?: (err: Error) => void
  ): Promise<RecipeData[] | undefined> {
    const query = `SELECT ${User.genFieldsFromData(
      readData
    )} FROM recipes WHERE user_id = ($1)`;
    return User.query(query, [userId], onError);
  }
}

export default User;
