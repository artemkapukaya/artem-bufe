CREATE TABLE `product_option_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`optionId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`priceModifier` int DEFAULT 0,
	`isDefault` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_option_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('size','addon','drink') NOT NULL,
	`isRequired` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_options_id` PRIMARY KEY(`id`)
);
