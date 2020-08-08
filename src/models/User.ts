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
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  static async create(
    pool: Pool,
    userCreateData: UserCreateData
  ): Promise<User> {
    const query = `
    INSERT INTO users(gmail, first_name, last_name, login_ip, secure_key)
    VALUES
    ($1, $2, $3, $4, $5) RETURNING users.id;`;

    try {
      const result = await pool.query(query, [
        userCreateData.gmail,
        userCreateData.first_name,
        userCreateData.last_name,
        userCreateData.login_ip,
        userCreateData.secure_key,
      ]);
      return new User(result.rows[0].id);
    } catch (err) {
      return err;
    }
  }

  getUserId(): number {
    return this.id;
  }

  async queryUserDataById(
    pool: Pool,
    queryData: QueryUserData
  ): Promise<UserData> {
    let query = '';
    if (queryData.all) {
      query = `SELECT * FROM users WHERE users.id = ${this.getUserId()};`;
    } else {
      const dataFields = [];
      query = 'SELECT ';
      if (queryData.gmail) dataFields.push('gmail');
      if (queryData.first_name) dataFields.push('first_name');
      if (queryData.last_name) dataFields.push('last_name');
      if (queryData.create_date) dataFields.push('create_date');
      if (queryData.img_file_name) dataFields.push('img_file_name');
      if (queryData.last_update) dataFields.push('last_update');
      if (queryData.login_ip) dataFields.push('login_ip');
      if (queryData.secure_key) dataFields.push('secure_key');

      query += `${dataFields.join(', ')} FROM users WHERE users.id = ${
        this.id
      };`;
    }

    return (await pool.query(query)).rows[0];
  }
}

export default User;
