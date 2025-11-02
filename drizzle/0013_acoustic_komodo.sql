CREATE TABLE `authentic_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`device_name` varchar(255),
	`device_model` varchar(100),
	`owner_name` varchar(255) NOT NULL,
	`phone_number` varchar(20),
	`is_active` int NOT NULL DEFAULT 1,
	`last_verified` timestamp NOT NULL DEFAULT (now()),
	`verification_count` int NOT NULL DEFAULT 1,
	`registered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authentic_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `authentic_devices_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `blocked_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`device_type_blocked` enum('emulator','clone','vm','unknown') NOT NULL,
	`block_reason` text NOT NULL,
	`attempt_count` int NOT NULL DEFAULT 1,
	`first_attempt` timestamp NOT NULL DEFAULT (now()),
	`last_attempt` timestamp NOT NULL DEFAULT (now()),
	`ip_addresses` text,
	`is_permanent` int NOT NULL DEFAULT 1,
	`blocked_by` varchar(255) DEFAULT 'system',
	CONSTRAINT `blocked_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `blocked_devices_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `clone_detection_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`device_type` enum('authentic','emulator','clone','vm','unknown') NOT NULL,
	`confidence` varchar(10) NOT NULL,
	`is_blocked` int NOT NULL DEFAULT 0,
	`user_agent` text,
	`platform` varchar(255),
	`screen_resolution` varchar(50),
	`ip_address` varchar(45),
	`reasons` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clone_detection_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clone_detection_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`total_attempts` int NOT NULL DEFAULT 0,
	`authentic_attempts` int NOT NULL DEFAULT 0,
	`clone_attempts` int NOT NULL DEFAULT 0,
	`emulator_attempts` int NOT NULL DEFAULT 0,
	`vm_attempts` int NOT NULL DEFAULT 0,
	`blocked_attempts` int NOT NULL DEFAULT 0,
	`unique_fingerprints` int NOT NULL DEFAULT 0,
	`average_confidence` varchar(10),
	CONSTRAINT `clone_detection_stats_id` PRIMARY KEY(`id`)
);
