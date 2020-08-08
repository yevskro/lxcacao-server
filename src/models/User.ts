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
    INSERT INTO users(gmail, first_name, last_name, login_ip, secureKey)
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
      console.log('123123');
      console.log({ userData });
      console.log({ result });
      return new User(1);
    } catch {
      return new Error('Wrong credintials.');
    }
  }

  getId(): number {
    return this.id;
  }
}

export default User;
