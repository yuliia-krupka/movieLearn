CREATE TABLE user_learning_set
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    learning_set_id INT,
    completed_items INT,
    score           INT,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (learning_set_id) REFERENCES learning_set (id) ON DELETE CASCADE
);