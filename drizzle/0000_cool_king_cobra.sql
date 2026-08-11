CREATE TABLE `campaign_readiness` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(64) NOT NULL,
	`industry` varchar(64) NOT NULL,
	`seniority` varchar(32) NOT NULL,
	`language` varchar(16) NOT NULL,
	`targetRoles` json NOT NULL,
	`primaryField` varchar(100) NOT NULL,
	`cvReadable` boolean NOT NULL,
	`consented` boolean NOT NULL,
	`source` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_readiness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
