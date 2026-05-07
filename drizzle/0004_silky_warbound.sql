CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`icon` varchar(255),
	`color` varchar(7) DEFAULT '#FF6B35',
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`commissionRate` int NOT NULL DEFAULT 0,
	`minAmount` int NOT NULL DEFAULT 0,
	`maxAmount` int NOT NULL DEFAULT 999999999,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_slug_unique` UNIQUE(`slug`)
);
