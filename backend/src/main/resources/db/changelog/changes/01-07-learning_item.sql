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
