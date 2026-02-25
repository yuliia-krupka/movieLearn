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
