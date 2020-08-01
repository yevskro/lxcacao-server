/* prettier-ignore */
DROP TABLE users;

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
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id)
);

CREATE TABLE users_blocked
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    blocked_id INTEGER REFERENCES users(id)
);

CREATE TABLE users_requests
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_id INTEGER REFERENCES users(id)
);

CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    name TEXT,
    time TEXT,
    type TEXT,
    private BOOLEAN,
    img_file_name TEXT,
    ingredients TEXT[],
    how_to_prepare TEXT[]
);

CREATE TABLE users_recipes
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    recipe_id INTEGER REFERENCES recipes(id)
);

CREATE TABLE users_chats
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER,
    msgs TEXT[]
);