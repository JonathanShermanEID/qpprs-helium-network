CREATE TABLE `rewardsBank` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` varchar(64) NOT NULL,
	`hotspotId` varchar(128),
	`amount` varchar(50) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'HNT',
	`transactionType` enum('reward','withdrawal','transfer') NOT NULL DEFAULT 'reward',
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewardsBank_id` PRIMARY KEY(`id`)
);
