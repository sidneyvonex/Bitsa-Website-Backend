import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  integer,
  boolean,
  text,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

//
// ────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────
//

export const majorEnum = pgEnum("majorEnum", [
  "Software Engineering",
  "Networking",
  "Cybersecurity",
  "BBIT",
  "Data Science",
  "Other",
]);

export const roleEnum = pgEnum("roleEnum", [
  "student",
  "admin",
  "superadmin",
]);

//
// ────────────────────────────────────────────────
// USERS TABLE
// ────────────────────────────────────────────────
//

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  schoolId: varchar("schoolId", { length: 50 }).notNull().unique(),
  isInternal: boolean("isInternal").default(true),

  schoolName: varchar("schoolName", { length: 255 }),

  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),

  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),

  major: majorEnum("major").default("Other"),
  customMajor: varchar("customMajor", { length: 255 }),

  yearOfStudy: integer("yearOfStudy").notNull(),

  role: roleEnum("role").default("student").notNull(),
  isActive: boolean("isActive").default(true),

  profilePicture: text("profilePicture"),
  bio: text("bio"),

  emailVerified: boolean("emailVerified").default(false),
  lastLogin: timestamp("lastLogin"),

  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// INTERESTS + USER INTERESTS (MANY-TO-MANY)
// ────────────────────────────────────────────────
//

export const interests = pgTable("interests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const userInterests = pgTable(
  "userInterests",
  {
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    interestId: uuid("interestId")
      .references(() => interests.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("createdAt").defaultNow(),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.interestId),
  })
);

//
// ────────────────────────────────────────────────
// PROJECTS TABLE
// ────────────────────────────────────────────────
//

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),

  problemStatement: text("problemStatement"),
  proposedSolution: text("proposedSolution"),

  techStack: varchar("techStack", { length: 255 }),

  proposalDocument: text("proposalDocument"), // PDF URL
  githubUrl: varchar("githubUrl", { length: 255 }),
  images: text("images"), // JSON or CSV

  status: varchar("status", { length: 50 }).default("submitted"),

  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// LEADERS (CURRENT + PAST)
// ────────────────────────────────────────────────
//

export const leaders = pgTable("leaders", {
  id: uuid("id").defaultRandom().primaryKey(),

  fullName: varchar("fullName", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),

  academicYear: varchar("academicYear", { length: 20 }).notNull(), // e.g. "2024/2025"

  profilePicture: text("profilePicture"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),

  isCurrent: boolean("isCurrent").default(false),

  createdAt: timestamp("createdAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// COMMUNITIES
// ────────────────────────────────────────────────
//

export const communities = pgTable("communities", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  whatsappLink: varchar("whatsappLink", { length: 255 }).notNull(),

  createdAt: timestamp("createdAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// BLOGS
// ────────────────────────────────────────────────
//

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),

  category: varchar("category", { length: 100 }),
  readTime: integer("readTime"),

  coverImage: text("coverImage"),

  authorId: uuid("authorId").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// EVENTS
// ────────────────────────────────────────────────
//

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),

  image: text("image"),

  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),

  locationName: varchar("locationName", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),

  createdBy: uuid("createdBy").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("createdAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// GALLERY
// ────────────────────────────────────────────────
//

export const gallery = pgTable("gallery", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }),
  imageUrl: text("imageUrl").notNull(),

  eventId: uuid("eventId").references(() => events.id, {
    onDelete: "set null",
  }),

  uploadedBy: uuid("uploadedBy").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("createdAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// PARTNERS (OPTIONAL BUT USEFUL)
// ────────────────────────────────────────────────
//

export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

//
// ────────────────────────────────────────────────
// REPORTS (OPTIONAL)
// ────────────────────────────────────────────────
//

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),

  fileUrl: text("fileUrl"),

  createdBy: uuid("createdBy").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("createdAt").defaultNow(),
});
