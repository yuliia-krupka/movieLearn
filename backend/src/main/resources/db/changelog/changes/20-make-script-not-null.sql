-- liquibase formatted sql

-- changeset juliakrupka:20-make-script-not-null
ALTER TABLE movie MODIFY COLUMN script LONGBLOB NOT NULL;
