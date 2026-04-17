import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const searches = mysqlTable("searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  researchField: text("researchField").notNull(),
  universityPreference: varchar("universityPreference", { length: 255 }),
  locationPreference: varchar("locationPreference", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Search = typeof searches.$inferSelect;
export type InsertSearch = typeof searches.$inferInsert;

export const professors = mysqlTable("professors", {
  id: int("id").autoincrement().primaryKey(),
  searchId: int("searchId").notNull().references(() => searches.id),
  name: varchar("name", { length: 255 }).notNull(),
  university: varchar("university", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  researchInterests: text("researchInterests"),
  recentPapers: text("recentPapers"), // JSON array stored as text
  contactEmail: varchar("contactEmail", { length: 320 }),
  profileUrl: text("profileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Professor = typeof professors.$inferSelect;
export type InsertProfessor = typeof professors.$inferInsert;

export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  professorId: int("professorId").notNull().references(() => professors.id),
  originalContent: text("originalContent").notNull(),
  editedContent: text("editedContent"),
  wasSent: mysqlEnum("wasSent", ["yes", "no", "unknown"]).default("unknown").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  fullName: varchar("fullName", { length: 255 }),
  university: varchar("university", { length: 255 }),
  major: varchar("major", { length: 255 }),
  year: varchar("year", { length: 50 }),
  gpa: varchar("gpa", { length: 10 }),
  researchInterests: text("researchInterests"),
  skills: text("skills"),
  pastExperience: text("pastExperience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export const outreach = mysqlTable("outreach", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  professorId: int("professorId").notNull().references(() => professors.id),
  emailId: int("emailId").notNull().references(() => emails.id),
  status: mysqlEnum("status", [
    "draft",
    "sent",
    "replied",
    "no_response",
    "meeting_scheduled",
    "rejected",
  ])
    .default("draft")
    .notNull(),
  sentAt: timestamp("sentAt"),
  repliedAt: timestamp("repliedAt"),
  notes: text("notes"),
  followUpReminder: timestamp("followUpReminder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Outreach = typeof outreach.$inferSelect;
export type InsertOutreach = typeof outreach.$inferInsert;
export const professorBookmarks = mysqlTable("professorBookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  professorId: int("professorId").notNull().references(() => professors.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfessorBookmark = typeof professorBookmarks.$inferSelect;
export type InsertProfessorBookmark = typeof professorBookmarks.$inferInsert;

export const professorScores = mysqlTable("professorScores", {
  id: int("id").autoincrement().primaryKey(),
  professorId: int("professorId").notNull().references(() => professors.id),
  userId: int("userId").notNull().references(() => users.id),
  matchScore: int("matchScore").notNull(),
  reasoning: text("reasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfessorScore = typeof professorScores.$inferSelect;
export type InsertProfessorScore = typeof professorScores.$inferInsert;

export const followUpEmails = mysqlTable("followUpEmails", {
  id: int("id").autoincrement().primaryKey(),
  outreachId: int("outreachId").notNull().references(() => outreach.id),
  emailContent: text("emailContent").notNull(),
  tone: mysqlEnum("tone", ["formal", "friendly", "concise"]).default("formal").notNull(),
  daysAfterOriginal: int("daysAfterOriginal").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FollowUpEmail = typeof followUpEmails.$inferSelect;
export type InsertFollowUpEmail = typeof followUpEmails.$inferInsert;

export const emailTonePreferences = mysqlTable("emailTonePreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  defaultTone: mysqlEnum("defaultTone", ["formal", "friendly", "concise"])
    .default("formal")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTonePreference = typeof emailTonePreferences.$inferSelect;
export type InsertEmailTonePreference = typeof emailTonePreferences.$inferInsert;
