CREATE TYPE "public"."majorEnum" AS ENUM('Software Engineering', 'Networking', 'Cybersecurity', 'BBIT', 'Data Science', 'Other');--> statement-breakpoint
CREATE TYPE "public"."roleEnum" AS ENUM('student', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"readTime" integer,
	"coverImage" text,
	"authorId" uuid,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"whatsappLink" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"locationName" varchar(255) NOT NULL,
	"latitude" varchar(50),
	"longitude" varchar(50),
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"imageUrl" text NOT NULL,
	"eventId" uuid,
	"uploadedBy" uuid,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "interests_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "leaders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"academicYear" varchar(20) NOT NULL,
	"profilePicture" text,
	"email" varchar(255),
	"phone" varchar(50),
	"isCurrent" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo" text,
	"website" varchar(255),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"problemStatement" text,
	"proposedSolution" text,
	"techStack" varchar(255),
	"proposalDocument" text,
	"githubUrl" varchar(255),
	"images" text,
	"status" varchar(50) DEFAULT 'submitted',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"fileUrl" text,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userInterests" (
	"userId" uuid NOT NULL,
	"interestId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "userInterests_userId_interestId_pk" PRIMARY KEY("userId","interestId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schoolId" varchar(50) NOT NULL,
	"isInternal" boolean DEFAULT true,
	"schoolName" varchar(255),
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"major" "majorEnum" DEFAULT 'Other',
	"customMajor" varchar(255),
	"yearOfStudy" integer NOT NULL,
	"role" "roleEnum" DEFAULT 'student' NOT NULL,
	"isActive" boolean DEFAULT true,
	"profilePicture" text,
	"bio" text,
	"emailVerified" boolean DEFAULT false,
	"lastLogin" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_schoolId_unique" UNIQUE("schoolId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userInterests" ADD CONSTRAINT "userInterests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userInterests" ADD CONSTRAINT "userInterests_interestId_interests_id_fk" FOREIGN KEY ("interestId") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;