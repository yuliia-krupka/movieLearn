-- liquibase formatted sql

-- changeset yuliia-krupka:14-add-foreign-key-to-movie
ALTER TABLE movie
MODIFY COLUMN creator_id INT;

ALTER TABLE movie
ADD CONSTRAINT fk_movie_creator
FOREIGN KEY (creator_id) REFERENCES users(id)
ON DELETE CASCADE;
