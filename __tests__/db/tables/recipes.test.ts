import { Pool } from 'pg';
/*  
    name TEXT NOT NULL CHECK (name <> ''),
    time TEXT NOT NULL CHECK (name <> ''),
    type TEXT NOT NULL CHECK (type <> ''),
    private BOOLEAN NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT {''},
    how_to_prepare TEXT[] NOT NULL DEFAULT {''},
    from_id INTEGER REFERENCES users(id) DEFAULT 0,
    from_full_name TEXT DEFAULT '',
    img_file_name TEXT NOT NULL DEFAULT '',
    create_date TIMESTAMP DEFAULT NOW() 
    check a recipe can be created with mandotory fields
    check a recipe can't be created without mandatory fields
    check a recipe can be created with all fields
    check mandotory fields can't be null or empty strings
    check ingredients and how to prepare can hold arrays
    check from_full_name can't be an empty string if there is a from_id
*/
export default (): void => {
  const conString = 'postgres://postgres@127.0.0.1:5432/testdb';

  let pool: Pool;
  let query: string;
  beforeAll((): void => {
    pool = new Pool({ connectionString: conString });
  });

  afterAll(async (): Promise<void> => pool.end());
};
