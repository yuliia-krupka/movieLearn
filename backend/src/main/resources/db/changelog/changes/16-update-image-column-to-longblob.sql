-- liquibase formatted sql
-- changeset yuliia_krupka:16

-- Convert image column from VARCHAR to LONGBLOB to store binary data
ALTER TABLE movie MODIFY COLUMN image LONGBLOB;
