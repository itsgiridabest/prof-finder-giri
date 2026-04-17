CREATE TABLE `outreach` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorId` int NOT NULL,
	`emailId` int NOT NULL,
	`status` enum('draft','sent','replied','no_response','meeting_scheduled','rejected') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`repliedAt` timestamp,
	`notes` text,
	`followUpReminder` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255),
	`university` varchar(255),
	`major` varchar(255),
	`year` varchar(50),
	`gpa` varchar(10),
	`researchInterests` text,
	`skills` text,
	`pastExperience` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `outreach` ADD CONSTRAINT `outreach_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outreach` ADD CONSTRAINT `outreach_professorId_professors_id_fk` FOREIGN KEY (`professorId`) REFERENCES `professors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outreach` ADD CONSTRAINT `outreach_emailId_emails_id_fk` FOREIGN KEY (`emailId`) REFERENCES `emails`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;