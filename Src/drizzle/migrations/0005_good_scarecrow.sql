CREATE TYPE "public"."actionEnum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACTIVATE', 'DEACTIVATE', 'ROLE_CHANGE', 'PASSWORD_RESET', 'EMAIL_VERIFY', 'PROFILE_UPDATE', 'OTHER');--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(50),
	"userEmail" varchar(255),
	"userRole" varchar(50),
	"action" "actionEnum" NOT NULL,
	"actionDescription" text NOT NULL,
	"resourceType" varchar(100),
	"resourceId" varchar(255),
	"metadata" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"oldValues" text,
	"newValues" text,
	"success" boolean DEFAULT true NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletedBy" varchar(50);