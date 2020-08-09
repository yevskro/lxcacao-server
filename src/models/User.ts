/* eslint-disable camelcase */
import { Pool } from 'pg';

type UserId = number;
type RecipeId = number;
type Fields = string[];
type FieldParams = string[];
type Params = string[];
type Values = (string | number | boolean)[];
type Query = string;

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

interface UpdateRecipeData {
  name?: string;
  time?: string;
  type?: string;
  private?: boolean;
  ingredients?: string[];
  how_to_prepare?: string[];
  from_id?: number;
  from_full_name?: string;
  img_file_name?: string;
}

class User {
  /* * * * * * Helper Methods * * * * * */
  private static genFieldsFromData(
    queryData: ReadRecipeData | ReadUserData | UserData | RecipeData
  ): string[] {
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
    data: RecipeData | UserData
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
    data: RecipeData | UserData
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
    createData: CreateRecipeData | CreateUserData
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

  private static genReadQueryByIdOrGmail(
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

  private static genUpdateQueryById(
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

  /* * * * * * * * * * * * * * * * * * * * * */
  static async create(
    pool: Pool,
    createData: CreateUserData,
    onError?: (err: Error) => void
  ): Promise<UserId> {
    const [query, values] = User.genCreateQueryAndValues('users', createData);

    try {
      return (await pool.query(query, [...values])).rows[0].id;
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  static async readUserDataById(
    pool: Pool,
    id: number,
    readData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    const [query, values] = User.genReadQueryByIdOrGmail(id, 'users', readData);

    try {
      return (await pool.query(query, values)).rows[0];
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  static async readUserDataByGmail(
    pool: Pool,
    gmail: string,
    readData: ReadUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    const [query, values] = User.genReadQueryByIdOrGmail(
      null,
      'users',
      readData,
      gmail
    );

    try {
      return (await pool.query(query, values)).rows[0];
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  static async updateUser(
    pool: Pool,
    id: number,
    updateData: UpdateUserData,
    onError?: (err: Error) => void
  ): Promise<void> {
    const [query, values] = this.genUpdateQueryById(id, 'users', updateData);

    try {
      await pool.query(query, [...values]);
    } catch (err) {
      if (err) onError(err);
    }
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
