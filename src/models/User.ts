/* eslint-disable camelcase */
import { Pool } from 'pg';

export interface UserCreateData {
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

export interface QueryUserData {
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

class User {
  static async create(
    pool: Pool,
    userCreateData: UserCreateData,
    onError?: (err: Error) => void
  ): Promise<number> {
    const query = `
    INSERT INTO users(gmail, first_name, last_name, login_ip, secure_key)
    VALUES
    ($1, $2, $3, $4, $5) RETURNING users.id;`;

    try {
      return (
        await pool.query(query, [
          userCreateData.gmail,
          userCreateData.first_name,
          userCreateData.last_name,
          userCreateData.login_ip,
          userCreateData.secure_key,
        ])
      ).rows[0].id;
    } catch (err) {
      if (onError) onError(err);
    }

    return undefined;
  }

  private static genQueryDataString(queryData: QueryUserData) {
    const dataFields = [];
    if (queryData.id) dataFields.push('id');
    if (queryData.gmail) dataFields.push('gmail');
    if (queryData.first_name) dataFields.push('first_name');
    if (queryData.last_name) dataFields.push('last_name');
    if (queryData.create_date) dataFields.push('create_date');
    if (queryData.img_file_name) dataFields.push('img_file_name');
    if (queryData.last_update) dataFields.push('last_update');
    if (queryData.login_ip) dataFields.push('login_ip');
    if (queryData.secure_key) dataFields.push('secure_key');
    return dataFields.join(', ');
  }

  static async queryUserDataById(
    pool: Pool,
    id: number,
    queryData: QueryUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    let query = '';
    if (queryData.all) {
      query = `SELECT * FROM users WHERE users.id = ($1);`;
    } else {
      query = 'SELECT ';
      query += `${User.genQueryDataString(
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

  static async queryUserDataByGmail(
    pool: Pool,
    gmail: string,
    queryData: QueryUserData,
    onError?: (err: Error) => void
  ): Promise<UserData> {
    let query = '';
    if (queryData.all) {
      query = 'SELECT * FROM users WHERE users.gmail = ($1);';
    } else {
      query = 'SELECT ';
      query += `${User.genQueryDataString(
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
}

export default User;
