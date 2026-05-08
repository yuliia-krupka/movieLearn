-- liquibase formatted sql

-- changeset juliakrupka:19-make-script-not-null
DELETE FROM movie WHERE script IS NULL;
ALTER TABLE movie MODIFY script LONGBLOB NOT NULL;
