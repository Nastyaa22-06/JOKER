CREATE TABLE `advertising_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`placement` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`brand_url` text,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
