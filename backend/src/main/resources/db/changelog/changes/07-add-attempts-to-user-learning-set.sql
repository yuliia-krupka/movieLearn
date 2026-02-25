ALTER TABLE user_learning_set
    ADD COLUMN flashcards_attempts INT DEFAULT 0,
    ADD COLUMN tests_attempts      INT DEFAULT 0;
