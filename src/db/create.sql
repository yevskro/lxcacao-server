/* prettier-ignore */
DROP TABLE IF EXISTS users_chats;
DROP TABLE IF EXISTS users_recipes;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users_requests;
DROP TABLE IF EXISTS users_blocks;
DROP TABLE IF EXISTS users_friends;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL CHECK (gmail <> ''),
    first_name TEXT NOT NULL CHECK (first_name <> ''),
    last_name TEXT NOT NULL CHECK (last_name <> ''),
    login_ip TEXT NOT NULL CHECK (login_ip <> ''),
    secure_key TEXT UNIQUE NOT NULL CHECK (secure_key <> ''),
    img_file_name TEXT DEFAULT '',
    last_update TIMESTAMP DEFAULT NOW(),
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_friends
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    friend_id INTEGER REFERENCES users(id) NOT NULL,
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_blocks
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    block_id INTEGER REFERENCES users(id) NOT NULL,
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_requests
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    request_id INTEGER REFERENCES users(id) NOT NULL,
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (name <> ''),
    time TEXT NOT NULL CHECK (name <> ''),
    type TEXT NOT NULL CHECK (type <> ''),
    private BOOLEAN NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    how_to_prepare TEXT[] NOT NULL DEFAULT '{}',
    from_id INTEGER REFERENCES users(id) DEFAULT 0,
    from_full_name TEXT DEFAULT '' IF from_id <> 0 THEN CHECK (from_full_name <> ''),
    img_file_name TEXT NOT NULL DEFAULT '',
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_recipes
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    recipe_id INTEGER REFERENCES recipes(id) NOT NULL
);

CREATE TABLE users_chats
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    friend_id INTEGER NOT NULL,
    msgs TEXT[]
);