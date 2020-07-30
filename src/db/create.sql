CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    gmail TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    loginIP TEXT NOT NULL,
    profileIMG TEXT DEFAULT NULL,
    lastUpdate TIMESTAMP DEFAULT NOW(),
    createDate TIMESTAMP DEFAULT NOW()
);