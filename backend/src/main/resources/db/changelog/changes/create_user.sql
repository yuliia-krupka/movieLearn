CREATE TABLE user
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    lastname      VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255),
    photo         LONGBLOB,
    english_level ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'A1',
    interests     JSON,
    role          ENUM ('ADMIN', 'USER') NOT NULL
);
