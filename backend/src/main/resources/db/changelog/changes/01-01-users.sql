CREATE TABLE users
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    lastname      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    photo         LONGBLOB,
    english_level ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'A1',
    interests     TEXT,
    role          ENUM ('ADMIN', 'USER') NOT NULL
);
