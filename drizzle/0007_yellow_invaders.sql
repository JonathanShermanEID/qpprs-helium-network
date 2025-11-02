CREATE TABLE `authorshipChanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(255) NOT NULL,
	`originalAuthorOpenId` varchar(64) NOT NULL,
	`originalAuthorName` text,
	`newAuthorOpenId` varchar(64) NOT NULL,
	`newAuthorName` text,
	`changeDetectedAt` timestamp NOT NULL DEFAULT (now()),
	`contentBeforeChange` text,
	`contentAfterChange` text,
	`restorationStatus` enum('pending','restored','failed','ignored') DEFAULT 'pending',
	`restoredAt` timestamp,
	CONSTRAINT `authorshipChanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversationBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(255) NOT NULL,
	`conversationTitle` text,
	`authorOpenId` varchar(64) NOT NULL,
	`authorName` text,
	`contentSnapshot` text NOT NULL,
	`messageCount` int DEFAULT 0,
	`backupTrigger` enum('screen_lock','manual','scheduled','authorship_change') NOT NULL,
	`backupLocation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversationBackups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversationScans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanType` enum('full_scan','incremental','authorship_check') NOT NULL,
	`conversationsScanned` int DEFAULT 0,
	`changesDetected` int DEFAULT 0,
	`backupsCreated` int DEFAULT 0,
	`authorshipChangesFound` int DEFAULT 0,
	`scanDurationMs` int,
	`scanStatus` enum('running','completed','failed') DEFAULT 'running',
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `conversationScans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenLockEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`lockType` enum('screen_lock','screen_unlock','page_hidden','page_visible') NOT NULL,
	`backupTriggered` int DEFAULT 0,
	`conversationsBackedUp` int DEFAULT 0,
	`eventTimestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `screenLockEvents_id` PRIMARY KEY(`id`)
);
