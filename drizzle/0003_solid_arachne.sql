CREATE TABLE `joker_coin_events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`identity_key` text NOT NULL,
	`action` text NOT NULL,
	`delta` integer NOT NULL,
	`applied` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `joker_profiles` ADD `coins` integer DEFAULT 0 NOT NULL;