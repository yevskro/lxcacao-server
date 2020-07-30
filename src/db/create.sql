DROP TABLE users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL CHECK (gmail <> ''),
    first_name TEXT NOT NULL CHECK (first_name <> ''),
    last_name TEXT NOT NULL CHECK (last_name <> ''),
    login_ip TEXT NOT NULL CHECK (login_ip <> ''),
    secure_key TEXT NOT NULL CHECK (secure_key <> ''),
    profile_img TEXT DEFAULT '',
    last_update TIMESTAMP DEFAULT NOW(),
    create_date TIMESTAMP DEFAULT NOW()
);

