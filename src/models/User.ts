/* eslint-disable camelcase */
import { Pool } from 'pg';

type UserId = number;
type RecipeId = number;
type Fields = string[];
type Values = string[];

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

interface CreateRecipeData {
  name: string;
  time: string;
  type: string;
  private: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  from_id?: number;
  from_full_name?: string;
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
  from_id?: boolean;
  from_full_name?: boolean;
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
  from_id?: number;
  from_full_name?: string;
  img_file_name?: string;
  create_date?: string;
}

class User {
  static async create(
    pool: Pool,
    createUserData: CreateUserData,
    onError?: (err: Error) => void
  ): Promise<UserId> {
    const [fields, values] = User.genFieldsAndValuesFromData(createUserData);

    const params: string[] = User.genParamsFromFieldsLength(fields.length);
    const query = `
    INSERT INTO users(${fields.join(', ')})
    VALUES
    (${params.join(', ')}) RETURNING users.id;`;

    try {
      return (await pool.query(query, [...values])).rows[0].id;
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  private static genFieldsFromData(
    queryData: ReadRecipeData | ReadUserData | UserData | RecipeData
  ): string[] {
    const fields: string[] = [];
    const keys = Object.keys(queryData);
    keys.forEach((key) => {
      fields.push(key.toString());
    });
    return fields;
  }

  private static genParamsFromFieldsLength(len: number): string[] {
    const params: string[] = [];
    for (let i = 1; i <= len; i += 1) {
      params.push(`$${i}`);
    }
    return params;
  }

  private static genFieldsAndValuesFromData(
    data: RecipeData | UserData
  ): [Fields, Values] {
    const values: string[] = [];
    const fields: string[] = [];
    Object.entries(data).forEach((keyValuePair) => {
      fields.push(keyValuePair[0]);
      values.push(keyValuePair[1]);
    });
    return [fields, values];
  }

  static async readUserDataById(
    pool: Pool,
    id: UserId,
    queryData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    let query = '';
    if (queryData.all) {
      query = `SELECT * FROM users WHERE users.id = ($1);`;
    } else {
      query = 'SELECT ';
      query += `${User.genFieldsFromData(
        queryData
      )} FROM users WHERE users.id = ($1);`;
    }

    try {
      return (await pool.query(query, [id])).rows[0];
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  static async readUserDataByGmail(
    pool: Pool,
    gmail: string,
    queryData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    let query = '';
    if (queryData.all) {
      query = 'SELECT * FROM users WHERE users.gmail = ($1);';
    } else {
      query = 'SELECT ';
      query += `${User.genFieldsFromData(
        queryData
      )} FROM users WHERE users.gmail = ($1);`;
    }

    try {
      return (await pool.query(query, [gmail])).rows[0];
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  /*
  static async createRecipe(
    userId: number,
    createRecipeData: CreateRecipeData,
    onError: (err: Error) => void
  ): Promise<RecipeId> {
    const query = `
    INSERT INTO recipes(${User.genQueryFromData(
      (createRecipeData as unknown) as QueryRecipeData
    )})
    VALUES
    ($1, $2, $3, $4, $5) RETURNING users.id;`;

    try {
      return (
        await pool.query(query, [
          createRecipeData.name,
          createRecipeData.first_name,
          createRecipeData.last_name,
          createRecipeData.login_ip,
          createRecipeData.secure_key,
        ])
      ).rows[0].id;
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  } */
}

export default User;
