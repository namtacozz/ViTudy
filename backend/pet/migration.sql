-- SQL Migration for MySQL: pet_streaks table
CREATE TABLE IF NOT EXISTS `pet_streaks` (
    `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `current_streak` INT NOT NULL DEFAULT 0,
    `longest_streak` INT NOT NULL DEFAULT 0,
    `last_checkin_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_pet_user_checkin` (`user_id`, `last_checkin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
