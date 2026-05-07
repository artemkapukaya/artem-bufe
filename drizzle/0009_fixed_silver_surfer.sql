DROP TABLE `admin_credentials`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
DROP TABLE `customer_addresses`;--> statement-breakpoint
DROP TABLE `loyalty_profiles`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `order_statuses`;--> statement-breakpoint
DROP TABLE `payment_methods`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
DROP TABLE `point_transactions`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
DROP TABLE `redeemed_rewards`;--> statement-breakpoint
DROP TABLE `rewards`;--> statement-breakpoint
DROP TABLE `sms_verifications`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `orders` DROP INDEX `orders_orderNumber_unique`;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `total_amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_number` varchar(500) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `orders` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `orderNumber`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `totalAmount`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `pointsEarned`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `pointsUsed`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `updatedAt`;