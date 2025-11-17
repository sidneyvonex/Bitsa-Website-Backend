ALTER TABLE "users" ADD COLUMN "refreshToken" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "refreshTokenExpiry" timestamp;