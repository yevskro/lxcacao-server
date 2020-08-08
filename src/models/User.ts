import { Pool } from 'pg';

interface UserData {
  gmail: string;
  firstName: string;
  lastName: string;
  loginIP: string;
  secureKey: string;
  imgFileName?: string; // file name of the users profile image
  lastUpdate?: string;
  createDate?: string;
}

class User {
  private id: number;

  /* HELPER METHODS */
  constructor(id: number) {
    this.id = id;
  }

  static async create(pool: Pool, userData: UserData): Promise<User | Error> {
    const query = `
    INSERT INTO users(gmail, first_name, last_name, login_ip, secure_key)
    VALUES
    ($1, $2, $3, $4, $5) RETURNING users.id;`;

    try {
      const result = await pool.query(query, [
        userData.gmail,
        userData.firstName,
        userData.lastName,
        userData.loginIP,
        userData.secureKey,
      ]);
      return new User(result.rows[0].id);
    } catch (err) {
      return err;
    }
  }

  getId(): number {
    return this.id;
  }
}

export default User;
