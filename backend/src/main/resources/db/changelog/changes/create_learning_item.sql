CREATE TABLE learning_item
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    type             ENUM ('word', 'phrase', 'test'),
    text             VARCHAR(255) NOT NULL,
    answers          JSON,
    example_sentence TEXT,
    translation      TEXT,
    learning_set_id  INT,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);