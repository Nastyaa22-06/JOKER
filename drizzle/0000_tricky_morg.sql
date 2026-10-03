CREATE TABLE `joker_rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`visibility` text NOT NULL,
	`mode` text NOT NULL,
	`password_hash` text,
	`player_count` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `joker_rooms_code_unique` ON `joker_rooms` (`code`);