DROP TABLE users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL CHECK (gmail <> ''),
    first_name TEXT NOT NULL CHECK (first_name <> ''),
    last_name TEXT NOT NULL CHECK (last_name <> ''),
    login_ip TEXT NOT NULL CHECK (login_ip <> ''),
    secure_key TEXT UNIQUE NOT NULL CHECK (secure_key <> ''),
    profile_img TEXT DEFAULT '',
    last_update TIMESTAMP DEFAULT NOW(),
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users_friends
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    friend_id INTEGER
);

CREATE TABLE users_blocked
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    blocked_id INTEGER
);

CREATE TABLE users_requests
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    request_id INTEGER
);

CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    name TEXT,
    time TEXT,
    type TEXT,
    private BOOLEAN,
    img TEXT,
    ingredients TEXT[],
    how_to_prepare TEXT[]
);

CREATE TABLE users_recipes
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    recipe_id INTEGER
);

CREATE TABLE users_chat
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    friend_id INTEGER,
    msgs TEXT[]
);