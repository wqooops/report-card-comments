CREATE TABLE "batch_files" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_time" timestamp NOT NULL,
	"filename" text NOT NULL,
	"r2_url" text NOT NULL,
	"r2_key" text NOT NULL,
	"student_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batch_files" ADD CONSTRAINT "batch_files_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batch_file_user_id_idx" ON "batch_files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "batch_file_session_idx" ON "batch_files" USING btree ("session_time");--> statement-breakpoint
CREATE INDEX "batch_file_expires_idx" ON "batch_files" USING btree ("expires_at");