--liquibase formatted sql

--changeset you:make-admin-by-email
UPDATE users
SET role = 'ADMIN'
WHERE email = 'yuliavikakrupka@gmail.com';