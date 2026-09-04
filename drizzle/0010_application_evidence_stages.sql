DROP INDEX `application_evidence_application_idx` ON `application_evidence`;
--> statement-breakpoint
CREATE UNIQUE INDEX `application_evidence_application_type_idx` ON `application_evidence` (`applicationId`,`evidenceType`);
