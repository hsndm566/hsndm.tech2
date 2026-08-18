CREATE TABLE `campaign_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`targetRole` varchar(120) NOT NULL,
	`city` varchar(64) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`language` varchar(16) NOT NULL,
	`campaignAuthorizationConfirmed` boolean NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_enquiries_reference_idx` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE INDEX `campaign_enquiries_created_at_idx` ON `campaign_enquiries` (`createdAt`);