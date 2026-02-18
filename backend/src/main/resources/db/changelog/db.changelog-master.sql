--liquibase formatted sql

--changeset antigravity:01-init-schema
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

CREATE TABLE genre
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE movie
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    image       LONGBLOB,
    script      LONGBLOB
);

CREATE TABLE movie_genre
(
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movie (id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genre (id) ON DELETE CASCADE
);

CREATE TABLE user_movie
(
    user_id  INT NOT NULL,
    movie_id INT NOT NULL,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie (id) ON DELETE CASCADE
);

CREATE TABLE learning_set
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(255),
    date     TIMESTAMP,
    movie_id INT,
    FOREIGN KEY (movie_id) REFERENCES movie (id) ON DELETE SET NULL
);

CREATE TABLE learning_item
(
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    type                 ENUM ('FLASH_CARD', 'TEST') NOT NULL,
    text                 VARCHAR(255) NOT NULL,
    answers              TEXT,
    example_sentence     TEXT,
    translation          TEXT,
    learning_set_id      INT,
    correct_answer_index INT DEFAULT NULL,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);

CREATE TABLE user_learning_set
(
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT,
    learning_set_id      INT,
    flashcards_completed BOOLEAN DEFAULT FALSE,
    tests_completed      BOOLEAN DEFAULT FALSE,
    flashcards_score     INT     DEFAULT 0,
    tests_score          INT     DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);

CREATE TABLE user_learning_item_status
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT,
    learning_item_id INT,
    learning_set_id  INT,
    status           ENUM ('NOT_STARTED', 'IN_PROGRESS', 'LEARNED', 'SKIPPED') NOT NULL DEFAULT 'NOT_STARTED',
    total_attempts   INT DEFAULT 0,
    correct_answers  INT DEFAULT 0,
    last_attempt_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_item_id) REFERENCES learning_item (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);

--changeset antigravity:02-learning-item-answers-table
CREATE TABLE learning_item_answers
(
    learning_item_id INT NOT NULL,
    answer           VARCHAR(255),
    FOREIGN KEY (learning_item_id) REFERENCES learning_item (id) ON DELETE CASCADE
);

ALTER TABLE learning_item DROP COLUMN answers;

--changeset antigravity:03-add-transcription-field
ALTER TABLE learning_item
    ADD COLUMN transcription VARCHAR(255) DEFAULT NULL;

