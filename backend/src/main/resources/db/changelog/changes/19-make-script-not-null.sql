-- liquibase formatted sql

-- changeset juliakrupka:19-delete-null-scripts
UPDATE movie
SET script = X''
WHERE script IS NULL;
