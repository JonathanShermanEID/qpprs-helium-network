CREATE TABLE `deviceActivations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`deviceType` enum('hotspot','gateway','repeater','phone') NOT NULL,
	`activationCode` varchar(64) NOT NULL,
	`status` enum('pending','activated','deactivated','suspended') NOT NULL DEFAULT 'pending',
	`ownerId` varchar(64) NOT NULL,
	`activatedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deviceActivations_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceActivations_deviceId_unique` UNIQUE(`deviceId`),
	CONSTRAINT `deviceActivations_activationCode_unique` UNIQUE(`activationCode`)
);
--> statement-breakpoint
CREATE TABLE `deviceConfigurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`firmwareVersion` varchar(32),
	`configData` text,
	`networkSettings` text,
	`securitySettings` text,
	`lastProgrammedAt` timestamp,
	`lastProgrammedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deviceConfigurations_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceConfigurations_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `deviceFirmware` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmwareId` varchar(128) NOT NULL,
	`version` varchar(32) NOT NULL,
	`deviceType` enum('hotspot','gateway','repeater','phone') NOT NULL,
	`releaseDate` timestamp NOT NULL,
	`downloadUrl` varchar(512),
	`checksum` varchar(128),
	`fileSize` varchar(50),
	`releaseNotes` text,
	`isStable` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deviceFirmware_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceFirmware_firmwareId_unique` UNIQUE(`firmwareId`)
);
--> statement-breakpoint
CREATE TABLE `deviceOTAUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`updateId` varchar(128) NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`firmwareId` varchar(128) NOT NULL,
	`status` enum('queued','downloading','installing','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deviceOTAUpdates_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceOTAUpdates_updateId_unique` UNIQUE(`updateId`)
);
--> statement-breakpoint
CREATE TABLE `deviceProvisioningLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`action` varchar(64) NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`performedBy` varchar(64),
	`details` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deviceProvisioningLogs_id` PRIMARY KEY(`id`)
);
