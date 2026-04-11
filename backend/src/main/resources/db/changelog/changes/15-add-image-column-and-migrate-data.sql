-- liquibase formatted sql
-- changeset yuliia_krupka:15

-- Add image column
ALTER TABLE movie
    ADD COLUMN image VARCHAR(255);

-- Populate image column based on tmdbId
UPDATE movie
SET image = CONCAT('/abstract/abstract-', CAST(((tmdb_id * 7) % 10) + 1 AS CHAR), '.svg')
WHERE tmdb_id IS NOT NULL
  AND (image IS NULL OR image = '');

-- Drop the old poster_path column
ALTER TABLE movie DROP COLUMN poster_path;
