-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `open_id` VARCHAR(64) NOT NULL,
    `union_id` VARCHAR(64) NULL,
    `nickname` VARCHAR(64) NOT NULL DEFAULT '',
    `avatar_url` VARCHAR(512) NOT NULL DEFAULT '',
    `notify_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_open_id_key`(`open_id`),
    INDEX `users_union_id_idx`(`union_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pets` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `species` ENUM('cat', 'dog', 'other') NOT NULL DEFAULT 'cat',
    `original_image_url` VARCHAR(512) NOT NULL DEFAULT '',
    `stylized_image_url` VARCHAR(512) NOT NULL DEFAULT '',
    `image_style` VARCHAR(32) NOT NULL DEFAULT '',
    `image_status` ENUM('pending', 'processing', 'done', 'failed') NOT NULL DEFAULT 'pending',
    `image_updated_at` DATETIME(3) NULL,
    `stats` JSON NOT NULL,
    `last_cron_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pets_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_interactions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pet_id` INTEGER UNSIGNED NOT NULL,
    `interaction_type` ENUM('feed', 'pet_action', 'play') NOT NULL,
    `interaction_date` DATE NOT NULL,
    `count` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `stats_delta` JSON NULL,
    `last_interacted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `daily_interactions_pet_id_interaction_date_idx`(`pet_id`, `interaction_date`),
    UNIQUE INDEX `daily_interactions_pet_id_interaction_type_interaction_date_key`(`pet_id`, `interaction_type`, `interaction_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notify_logs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `pet_id` INTEGER UNSIGNED NOT NULL,
    `notify_type` ENUM('low_stats', 'welcome', 'daily_remind') NOT NULL DEFAULT 'low_stats',
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stats_snapshot` JSON NULL,

    INDEX `notify_logs_pet_id_notify_type_sent_at_idx`(`pet_id`, `notify_type`, `sent_at`),
    INDEX `notify_logs_user_id_sent_at_idx`(`user_id`, `sent_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pets` ADD CONSTRAINT `pets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_interactions` ADD CONSTRAINT `daily_interactions_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notify_logs` ADD CONSTRAINT `notify_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notify_logs` ADD CONSTRAINT `notify_logs_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
