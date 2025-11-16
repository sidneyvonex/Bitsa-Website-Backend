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
  
  // Enums
  export const majorEnum = pgEnum("majorEnum", [
    "Software Engineering",
    "Networking",
    "Cybersecurity",
    "BBIT",
    "Data Science",
    "Other"
  ]);
  
  export const roleEnum = pgEnum("roleEnum", [
    "student",
    "admin",
    "superadmin",
  ]);
  
  // Users Table
  export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: varchar("schoolId", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    major: majorEnum("major"),
    yearOfStudy: integer("yearOfStudy").notNull(),
    schoolName: varchar("schoolName", { length: 255 }),
    role: roleEnum("role").default("student").notNull(),
    isActive: boolean("isActive").default(true),
    profilePicture: text("profilePicture"),
    bio: text("bio"),
    emailVerified: boolean("emailVerified").default(false),
    lastLogin: timestamp("lastLogin"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  });
  
  