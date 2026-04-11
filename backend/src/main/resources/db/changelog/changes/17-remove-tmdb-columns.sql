-- Remove tmdbId column from movie table
ALTER TABLE movie DROP COLUMN tmdb_id;

-- Remove unique constraint on tmdbId if exists
-- Note: This might be handled automatically by DROP COLUMN
