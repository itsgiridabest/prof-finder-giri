CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`professorId` int NOT NULL,
	`originalContent` text NOT NULL,
	`editedContent` text,
	`wasSent` enum('yes','no','unknown') NOT NULL DEFAULT 'unknown',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`searchId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`university` varchar(255) NOT NULL,
	`department` varchar(255),
	`researchInterests` text,
	`recentPapers` text,
	`contactEmail` varchar(320),
	`profileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `professors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`researchField` text NOT NULL,
	`universityPreference` varchar(255),
	`locationPreference` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `emails` ADD CONSTRAINT `emails_professorId_professors_id_fk` FOREIGN KEY (`professorId`) REFERENCES `professors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professors` ADD CONSTRAINT `professors_searchId_searches_id_fk` FOREIGN KEY (`searchId`) REFERENCES `searches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `searches` ADD CONSTRAINT `searches_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;