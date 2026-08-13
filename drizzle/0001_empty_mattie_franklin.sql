CREATE TABLE `backup_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleTaskUid` varchar(65) NOT NULL,
	`periodKey` varchar(10) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`byteSize` int NOT NULL,
	`recordCounts` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backup_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `backup_snapshot_schedule_period_idx` UNIQUE(`scheduleTaskUid`,`periodKey`)
);
--> statement-breakpoint
CREATE TABLE `candidate_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`targetCity` varchar(64) NOT NULL DEFAULT 'Jeddah',
	`targetIndustry` varchar(64) NOT NULL DEFAULT 'Technology & Engineering',
	`salaryExpectation` varchar(64) NOT NULL DEFAULT '15,000 - 25,000 SAR',
	`resumeFileName` varchar(255),
	`resumeSummary` text,
	`notifyWhatsApp` boolean NOT NULL DEFAULT true,
	`notifyEmail` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidate_profiles_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateOpenId` varchar(64),
	`candidateName` varchar(120) NOT NULL,
	`candidateEmail` varchar(320),
	`candidatePhone` varchar(64),
	`companyName` varchar(150) NOT NULL,
	`roleTitle` varchar(150) NOT NULL,
	`city` varchar(64) NOT NULL,
	`status` enum('queued','applied','interview','offer','skipped') NOT NULL DEFAULT 'applied',
	`channel` varchar(64) NOT NULL DEFAULT 'email-portal',
	`notes` text,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_jobs` (
	`name` varchar(100) NOT NULL,
	`heartbeatTaskUid` varchar(65) NOT NULL,
	`lastRunAt` timestamp,
	`lastStatus` varchar(32),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_jobs_name` PRIMARY KEY(`name`)
);
