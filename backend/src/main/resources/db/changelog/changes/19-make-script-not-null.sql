-- liquibase formatted sql

-- changeset juliakrupka:19-make-script-not-null
ALTER TABLE movie MODIFY script LONGBLOB NOT NULL;
