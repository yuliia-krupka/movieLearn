CREATE TABLE user_movie
(
    user_id  INT NOT NULL,
    movie_id INT NOT NULL,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie (id) ON DELETE CASCADE
);

