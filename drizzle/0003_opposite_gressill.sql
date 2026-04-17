CREATE TABLE `emailTonePreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`defaultTone` enum('formal','friendly','concise') NOT NULL DEFAULT 'formal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTonePreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailTonePreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `followUpEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`outreachId` int NOT NULL,
	`emailContent` text NOT NULL,
	`tone` enum('formal','friendly','concise') NOT NULL DEFAULT 'formal',
	`daysAfterOriginal` int NOT NULL,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followUpEmails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professorBookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `professorBookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professorScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`professorId` int NOT NULL,
	`userId` int NOT NULL,
	`matchScore` int NOT NULL,
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `professorScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `emailTonePreferences` ADD CONSTRAINT `emailTonePreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followUpEmails` ADD CONSTRAINT `followUpEmails_outreachId_outreach_id_fk` FOREIGN KEY (`outreachId`) REFERENCES `outreach`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professorBookmarks` ADD CONSTRAINT `professorBookmarks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professorBookmarks` ADD CONSTRAINT `professorBookmarks_professorId_professors_id_fk` FOREIGN KEY (`professorId`) REFERENCES `professors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professorScores` ADD CONSTRAINT `professorScores_professorId_professors_id_fk` FOREIGN KEY (`professorId`) REFERENCES `professors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professorScores` ADD CONSTRAINT `professorScores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;