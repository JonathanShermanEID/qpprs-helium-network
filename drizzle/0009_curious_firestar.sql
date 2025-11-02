CREATE TABLE `coverage_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`country` varchar(50) NOT NULL DEFAULT 'USA',
	`latitude` varchar(20) NOT NULL,
	`longitude` varchar(20) NOT NULL,
	`population_density` int,
	`estimated_hotspots` int,
	`coverage_gap` varchar(20),
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('detected','analyzing','planned','deploying','active') DEFAULT 'detected',
	`deployment_recommendations` text,
	`estimated_revenue` int,
	`competitor_presence` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverage_opportunities_id` PRIMARY KEY(`id`)
);
