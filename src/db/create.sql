DROP TABLE users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    login_ip TEXT NOT NULL,
    secure_key TEXT NOT NULL,
    profile_img TEXT DEFAULT NULL,
    last_update TIMESTAMP DEFAULT NOW(),
    create_date TIMESTAMP DEFAULT NOW()
);

