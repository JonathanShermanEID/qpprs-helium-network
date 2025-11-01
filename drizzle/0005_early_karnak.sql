CREATE TABLE `cableConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` varchar(128) NOT NULL,
	`name` varchar(255),
	`type` enum('cat5e','cat6','cat6a','coax') NOT NULL DEFAULT 'cat6',
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'inactive',
	`sourceNodeId` varchar(128),
	`targetNodeId` varchar(128),
	`bandwidth` varchar(50),
	`distance` varchar(50),
	`installDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cableConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `cableConnections_connectionId_unique` UNIQUE(`connectionId`)
);
--> statement-breakpoint
CREATE TABLE `dataProvisioning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`plan` varchar(64),
	`dataUsed` varchar(50) DEFAULT '0',
	`dataAllowed` varchar(50) DEFAULT '0',
	`speed` varchar(50),
	`qosLevel` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataProvisioning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fiberConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` varchar(128) NOT NULL,
	`name` varchar(255),
	`type` enum('single-mode','multi-mode','dark-fiber') NOT NULL DEFAULT 'single-mode',
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'inactive',
	`sourceNodeId` varchar(128),
	`targetNodeId` varchar(128),
	`bandwidth` varchar(50),
	`latency` varchar(50),
	`distance` varchar(50),
	`installDate` timestamp,
	`lastMaintenance` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fiberConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `fiberConnections_connectionId_unique` UNIQUE(`connectionId`)
);
--> statement-breakpoint
CREATE TABLE `textProvisioning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`messagesUsed` int NOT NULL DEFAULT 0,
	`messagesAllowed` int NOT NULL DEFAULT 0,
	`smsEnabled` int NOT NULL DEFAULT 1,
	`mmsEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `textProvisioning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceProvisioning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`plan` varchar(64),
	`minutesUsed` int NOT NULL DEFAULT 0,
	`minutesAllowed` int NOT NULL DEFAULT 0,
	`voipEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voiceProvisioning_id` PRIMARY KEY(`id`),
	CONSTRAINT `voiceProvisioning_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
