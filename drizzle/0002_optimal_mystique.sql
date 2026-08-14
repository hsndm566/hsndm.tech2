CREATE TABLE `campaign_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`signalType` varchar(64) NOT NULL,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`message` text NOT NULL,
	`resolved` boolean NOT NULL DEFAULT false,
	CONSTRAINT `campaign_signals_id` PRIMARY KEY(`id`)
);
