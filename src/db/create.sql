CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(20) UNIQUE NOT NULL,
    account_password VARCHAR(200) NOT NULL,
    create_date TIMESTAMP DEFAULT NOW()
);