CREATE TYPE "public"."languageEnum" AS ENUM('en', 'sw');--> statement-breakpoint
CREATE TABLE "blogTranslations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blogId" uuid NOT NULL,
	"language" "languageEnum" NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventTranslations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"language" "languageEnum" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"locationName" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reportTranslations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reportId" uuid NOT NULL,
	"language" "languageEnum" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "language" "languageEnum" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "language" "languageEnum" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "language" "languageEnum" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferredLanguage" "languageEnum" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "blogTranslations" ADD CONSTRAINT "blogTranslations_blogId_blogs_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventTranslations" ADD CONSTRAINT "eventTranslations_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportTranslations" ADD CONSTRAINT "reportTranslations_reportId_reports_id_fk" FOREIGN KEY ("reportId") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;