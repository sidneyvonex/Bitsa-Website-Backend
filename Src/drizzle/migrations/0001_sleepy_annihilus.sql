ALTER TABLE "users" ADD COLUMN "verificationToken" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verificationTokenExpiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetToken" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" timestamp;