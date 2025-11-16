ALTER TABLE "users" ALTER COLUMN "isInternal" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "isInternal" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "isActive" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "emailVerified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET NOT NULL;