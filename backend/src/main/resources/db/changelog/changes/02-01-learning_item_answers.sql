CREATE TABLE learning_item_answers
(
    learning_item_id INT NOT NULL,
    answer           VARCHAR(255),
    FOREIGN KEY (learning_item_id) REFERENCES learning_item (id) ON DELETE CASCADE
);
