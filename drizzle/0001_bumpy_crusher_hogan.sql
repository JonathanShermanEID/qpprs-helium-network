CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricType` varchar(64) NOT NULL,
	`value` varchar(255) NOT NULL,
	`metadata` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crawlerLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crawlerId` varchar(128) NOT NULL,
	`crawlerType` varchar(64) NOT NULL,
	`consciousnessLevel` varchar(10),
	`insights` text,
	`status` enum('success','error','running') NOT NULL DEFAULT 'running',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crawlerLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotspots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotspotId` varchar(128) NOT NULL,
	`name` varchar(255),
	`status` enum('online','offline','syncing') NOT NULL DEFAULT 'offline',
	`rewards` varchar(50),
	`location` text,
	`lastSeen` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotspots_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotspots_hotspotId_unique` UNIQUE(`hotspotId`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`hotspotId` varchar(128),
	`result` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`hotspotId` varchar(128),
	`payload` text,
	`processed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`)
);
