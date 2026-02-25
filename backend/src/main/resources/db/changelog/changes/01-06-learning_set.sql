CREATE TABLE learning_set
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(255),
    date     TIMESTAMP,
    movie_id INT,
    FOREIGN KEY (movie_id) REFERENCES movie (id) ON DELETE SET NULL
);
