CREATE TABLE `application_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`candidateOpenId` varchar(64) NOT NULL,
	`evidenceType` enum('portal_confirmation','email_accepted','employer_confirmation') NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `application_evidence_id` PRIMARY KEY(`id`),
	CONSTRAINT `application_evidence_application_idx` UNIQUE(`applicationId`)
);
--> statement-breakpoint
CREATE INDEX `application_evidence_candidate_idx` ON `application_evidence` (`candidateOpenId`,`capturedAt`);