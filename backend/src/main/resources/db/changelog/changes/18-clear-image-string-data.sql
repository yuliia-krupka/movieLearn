-- liquibase formatted sql
-- changeset yuliia_krupka:18

-- Clear old string-based abstract image paths stored in image LONGBLOB column.
-- Going forward, imageData = NULL means "use abstract image" (computed from movie id),
-- and imageData = <bytes> means a user-uploaded image.
UPDATE movie SET image = NULL;
