CREATE TABLE `creditTransformer` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` varchar(64) NOT NULL,
	`isActivated` int NOT NULL DEFAULT 0,
	`activatedAt` timestamp,
	`masterArtifactCertification` text,
	`shareholderValue` varchar(50) DEFAULT '0',
	`totalCreditsTransformed` varchar(50) DEFAULT '0',
	`transformationRate` varchar(20) DEFAULT '1.0',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditTransformer_id` PRIMARY KEY(`id`),
	CONSTRAINT `creditTransformer_ownerId_unique` UNIQUE(`ownerId`)
);
