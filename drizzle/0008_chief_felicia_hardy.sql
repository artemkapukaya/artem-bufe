CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('sms','email','push') NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`orderStatus` enum('pending','preparing','on_the_way','delivered','cancelled') NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` enum('pending','preparing','on_the_way','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`changedBy` varchar(100),
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_statuses_id` PRIMARY KEY(`id`)
);
