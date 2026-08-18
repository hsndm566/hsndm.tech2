CREATE TABLE `candidate_campaign_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`targetRoles` json NOT NULL,
	`targetCity` varchar(64) NOT NULL,
	`targetIndustry` varchar(100) NOT NULL,
	`seniority` varchar(32) NOT NULL,
	`preferredLanguage` varchar(16) NOT NULL,
	`openToRemote` boolean NOT NULL DEFAULT false,
	`authorizationConfirmed` boolean NOT NULL,
	`approvedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_campaign_approvals_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidate_campaign_approvals_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `candidate_campaign_approvals_updated_idx` ON `candidate_campaign_approvals` (`updatedAt`);