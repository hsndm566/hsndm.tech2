ALTER TABLE `candidate_profiles` ADD `fullName` varchar(120);--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `phone` varchar(64);--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `preferredSeniority` varchar(32) DEFAULT 'Mid-level' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `preferredLanguage` varchar(16) DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `openToRemote` boolean DEFAULT false NOT NULL;