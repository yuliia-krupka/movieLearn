CREATE TABLE movie
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    image       LONGBLOB,
    script      LONGBLOB
);