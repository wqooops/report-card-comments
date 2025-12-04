ALTER TABLE "user_credit" ADD COLUMN "daily_free_credits" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_credit" ADD COLUMN "daily_free_credits_reset_at" timestamp;