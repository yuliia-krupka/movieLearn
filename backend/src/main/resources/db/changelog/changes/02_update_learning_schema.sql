--liquibase formatted sql

--changeset antigravity:02-update-learning-item-type
-- Оновлюємо тип learning_item: замінюємо 'word','phrase','test' на 'FLASH_CARD','TEST'
ALTER TABLE learning_item
    MODIFY COLUMN type ENUM('FLASH_CARD', 'TEST') NOT NULL;

--changeset antigravity:02-update-user-learning-set
-- Замінюємо completed_items / score на окремі поля для flashcards і tests
ALTER TABLE user_learning_set
    ADD COLUMN flashcards_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN tests_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN flashcards_score INT DEFAULT 0,
    ADD COLUMN tests_score INT DEFAULT 0;

ALTER TABLE user_learning_set
DROP COLUMN completed_items,
    DROP COLUMN score;

--changeset antigravity:02-update-user-learning-item-status
-- Оновлюємо enum статусів і додаємо correct_answers
ALTER TABLE user_learning_item_status
    MODIFY COLUMN status ENUM('NOT_STARTED', 'IN_PROGRESS', 'LEARNED', 'SKIPPED') NOT NULL DEFAULT 'NOT_STARTED';

ALTER TABLE user_learning_item_status
    ADD COLUMN correct_answers INT DEFAULT 0;

-- Перейменовуємо attempts -> total_attempts для ясності
ALTER TABLE user_learning_item_status
    CHANGE COLUMN attempts total_attempts INT DEFAULT 0;