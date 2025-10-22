CREATE DATABASE IF NOT EXISTS `lead_api` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lead_api`;

CREATE TABLE IF NOT EXISTS `leads` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone_number` VARCHAR(32) NOT NULL,
    `requested_loan` DECIMAL(12,2) NOT NULL,
    `home_value` DECIMAL(12,2) NOT NULL,
    `city` VARCHAR(128) NOT NULL,
    `crm_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `IDX_leads_phone_number` (`phone_number`),
    CHECK (`requested_loan` > 0),
    CHECK (`home_value` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lead_applicants` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('first','second') NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `birth_date` DATE NOT NULL,
    `monthly_income` DECIMAL(12,2) NOT NULL,
    `pay_frequency` TINYINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_lead_type` (`lead_id`, `type`),
    CONSTRAINT `FK_applicant_lead`
    FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lead_simulations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_sim_lead` (`lead_id`),
    CONSTRAINT `FK_sim_lead`
    FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `idempotency_store` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idempotency_key` VARCHAR(128) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `response_status_code` INT NULL,
    `response_body_json` JSON NULL,
    `resource_id` BIGINT UNSIGNED NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_idempotency_key` (`idempotency_key`),
    UNIQUE KEY `UK_idempotency_resource` (`resource_id`),
    KEY `IDX_idempotency_expires` (`expires_at`),
    CONSTRAINT `FK_idemp_resource`
    FOREIGN KEY (`resource_id`) REFERENCES `lead_simulations`(`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;