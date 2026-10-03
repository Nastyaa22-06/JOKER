CREATE TABLE `joker_profiles` (
	`identity_key` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`avatar_json` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
