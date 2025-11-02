CREATE TABLE `digitalCertificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateId` varchar(255) NOT NULL,
	`certificateType` enum('conversation_backup','authorship_verification','device_authentication','network_certification','master_artifact') NOT NULL,
	`holderOpenId` varchar(64) NOT NULL,
	`holderName` text,
	`subjectId` varchar(255) NOT NULL,
	`subjectTitle` text,
	`verificationHash` varchar(64) NOT NULL,
	`certificate3DModel` text,
	`certificateMetadata` text,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`revokedAt` timestamp,
	`revocationReason` text,
	`validationStatus` enum('valid','expired','revoked','pending') DEFAULT 'valid',
	CONSTRAINT `digitalCertificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `digitalCertificates_certificateId_unique` UNIQUE(`certificateId`)
);
