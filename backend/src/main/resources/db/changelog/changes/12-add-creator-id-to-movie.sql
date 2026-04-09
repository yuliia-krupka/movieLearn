-- liquibase formatted sql

-- changeset yuliia-krupka:12-add-creator-id-to-movie
ALTER TABLE movie
ADD COLUMN creator_id BIGINT;
