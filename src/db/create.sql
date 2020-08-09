/* prettier-ignore */
DROP TABLE IF EXISTS users_chats;
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
    last_cache_update TIMESTAMP NOT NULL DEFAULT NOW(),
    create_date TIMESTAMP NOT NULL DEFAULT NOW() 
);

CREATE TABLE users_friends
(
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users_blocks
(
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users_requests
(
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (name <> ''),
    time TEXT NOT NULL CHECK (time <> ''),
    type TEXT NOT NULL CHECK (type <> ''),
    private BOOLEAN NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    how_to_prepare TEXT[] NOT NULL DEFAULT '{}',
    user_id INTEGER NOT NULL REFERENCES users(id),
    origin_user_id INTEGER NOT NULL REFERENCES users(id),
    origin_user_full_name TEXT NOT NULL CHECK (origin_user_full_name <> ''),
    img_file_name TEXT NOT NULL DEFAULT '',
    create_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users_chats
(
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    msgs TEXT[] NOT NULL DEFAULT '{}',
    last_cache_update TIMESTAMP NOT NULL DEFAULT NOW()
);