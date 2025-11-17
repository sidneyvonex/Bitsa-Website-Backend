import {pgTable,varchar,uuid,timestamp,integer,boolean,text,primaryKey,pgEnum,} from "drizzle-orm/pg-core";

//
// ────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────
//

export const majorEnum = pgEnum("majorEnum", [
  "Software Engineering",
  "Computer Science",
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
  isInternal: boolean("isInternal").default(false).notNull(),
  schoolName: varchar("schoolName", { length: 255 }),

  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),

  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),

  major: majorEnum("major").default("Other"),
  customMajor: varchar("customMajor", { length: 255 }),

  yearOfStudy: integer("yearOfStudy").notNull(),

  role: roleEnum("role").default("student").notNull(),
  isActive: boolean("isActive").default(true).notNull(),

  profilePicture: text("profilePicture"),
  bio: text("bio"),

  emailVerified: boolean("emailVerified").default(false).notNull(),
  // email verification & password reset
  verificationToken: varchar("verificationToken", { length: 255 }),
  verificationTokenExpiry: timestamp("verificationTokenExpiry"),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  // refresh token for issuing new access tokens
  refreshToken: varchar("refreshToken", { length: 255 }),
  refreshTokenExpiry: timestamp("refreshTokenExpiry"),
  lastLogin: timestamp("lastLogin"),

  // Soft delete
  deletedAt: timestamp("deletedAt"),
  deletedBy: varchar("deletedBy", { length: 50 }), // schoolId of who deleted

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

// -------------------------
// Type exports (inferred)
// -------------------------

// 1. Users
export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

// 2. Interests
export type TInterestInsert = typeof interests.$inferInsert;
export type TInterestSelect = typeof interests.$inferSelect;

// 3. User Interests
export type TUserInterestInsert = typeof userInterests.$inferInsert;
export type TUserInterestSelect = typeof userInterests.$inferSelect;

// 4. Projects
export type TProjectInsert = typeof projects.$inferInsert;
export type TProjectSelect = typeof projects.$inferSelect;

// 5. Leaders
export type TLeaderInsert = typeof leaders.$inferInsert;
export type TLeaderSelect = typeof leaders.$inferSelect;

// 6. Communities
export type TCommunityInsert = typeof communities.$inferInsert;
export type TCommunitySelect = typeof communities.$inferSelect;

// 7. Blogs
export type TBlogInsert = typeof blogs.$inferInsert;
export type TBlogSelect = typeof blogs.$inferSelect;

// 8. Events
export type TEventInsert = typeof events.$inferInsert;
export type TEventSelect = typeof events.$inferSelect;

// 9. Gallery
export type TGalleryInsert = typeof gallery.$inferInsert;
export type TGallerySelect = typeof gallery.$inferSelect;

// 10. Partners
export type TPartnerInsert = typeof partners.$inferInsert;
export type TPartnerSelect = typeof partners.$inferSelect;

// 11. Reports
export type TReportInsert = typeof reports.$inferInsert;
export type TReportSelect = typeof reports.$inferSelect;

//
// ────────────────────────────────────────────────
// AUDIT LOGS TABLE (SuperAdmin Oversight)
// ────────────────────────────────────────────────
//

export const actionEnum = pgEnum("actionEnum", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "ACTIVATE",
  "DEACTIVATE",
  "ROLE_CHANGE",
  "PASSWORD_RESET",
  "EMAIL_VERIFY",
  "PROFILE_UPDATE",
  "OTHER"
]);

export const auditLogs = pgTable("auditLogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Who performed the action
  userId: varchar("userId", { length: 50 }), // schoolId of actor
  userEmail: varchar("userEmail", { length: 255 }),
  userRole: varchar("userRole", { length: 50 }),
  
  // What action was performed
  action: actionEnum("action").notNull(),
  actionDescription: text("actionDescription").notNull(),
  
  // What resource was affected
  resourceType: varchar("resourceType", { length: 100 }), // e.g., "User", "Project", "Blog"
  resourceId: varchar("resourceId", { length: 255 }), // schoolId or other identifier
  
  // Additional context
  metadata: text("metadata"), // JSON string with additional details
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  
  // Before/After snapshots (for updates/deletes)
  oldValues: text("oldValues"), // JSON string of old values
  newValues: text("newValues"), // JSON string of new values
  
  // Status
  success: boolean("success").default(true).notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 12. Audit Logs
export type TAuditLogInsert = typeof auditLogs.$inferInsert;
export type TAuditLogSelect = typeof auditLogs.$inferSelect;
