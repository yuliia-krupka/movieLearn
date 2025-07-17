CREATE TABLE user_learning_item_status
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT,
    learning_item_id INT,
    learning_set_id  INT,
    status           ENUM ('not_started', 'in_progress', 'completed'),
    attempts         INT,
    last_attempt_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_item_id) REFERENCES learning_item (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);