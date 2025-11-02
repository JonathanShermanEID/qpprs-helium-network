CREATE TABLE `mtn_endpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`endpoint_url` text NOT NULL,
	`endpoint_data` text,
	`features` text,
	`last_scanned` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mtn_endpoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `mtn_endpoints_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `phone_verification_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`mtn_endpoint` text,
	`verizon_billing_data` text,
	`verification_status` enum('pending','verified','failed','suspicious') NOT NULL,
	`discrepancies_found` text,
	`hacking_detected` int NOT NULL DEFAULT 0,
	`feature_changes_detected` int NOT NULL DEFAULT 0,
	`verified_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phone_verification_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verizon_billing_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`billing_data` text NOT NULL,
	`active_features` text,
	`account_status` varchar(50),
	`last_synced` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verizon_billing_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `verizon_billing_records_phone_number_unique` UNIQUE(`phone_number`)
);
