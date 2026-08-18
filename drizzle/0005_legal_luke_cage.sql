ALTER TABLE `candidate_profiles` ADD `createdAt` timestamp NULL;
UPDATE `candidate_profiles` SET `createdAt` = `updatedAt` WHERE `createdAt` IS NULL;
ALTER TABLE `candidate_profiles` MODIFY COLUMN `createdAt` timestamp DEFAULT (now()) NOT NULL;
