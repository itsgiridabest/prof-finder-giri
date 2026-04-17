import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, searches, professors, emails, InsertProfessor, InsertEmail, profiles, outreach, InsertProfile, InsertOutreach, professorBookmarks, InsertProfessorBookmark, professorScores, InsertProfessorScore, followUpEmails, InsertFollowUpEmail, emailTonePreferences, InsertEmailTonePreference } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSearch(
  userId: number,
  researchField: string,
  universityPreference?: string,
  locationPreference?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(searches).values({
    userId,
    researchField,
    universityPreference: universityPreference || null,
    locationPreference: locationPreference || null,
  });

  return (result[0] as any)?.insertId || 0;
}

export async function getSearchById(searchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(searches).where(eq(searches.id, searchId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSearches(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(searches).where(eq(searches.userId, userId)).orderBy(searches.createdAt);
}

export async function createProfessor(data: InsertProfessor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(professors).values(data);
  // Return insertId for tracking
  return (result[0] as any)?.insertId || 0;
}

export async function getProfessorsBySearchId(searchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(professors).where(eq(professors.searchId, searchId));
}

export async function createEmail(data: InsertEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emails).values(data);
  return (result[0] as any)?.insertId || 0;
}

export async function getEmailByProfessorId(professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(emails).where(eq(emails.professorId, professorId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmail(emailId: number, editedContent: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emails).set({ editedContent }).where(eq(emails.id, emailId));
}

export async function markEmailAsSent(emailId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emails).set({ wasSent: "yes" }).where(eq(emails.id, emailId));
}

export async function getOrCreateProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(profiles).values({ userId });
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function updateProfile(userId: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(profiles).set(data).where(eq(profiles.userId, userId));
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createOutreach(data: InsertOutreach) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(outreach).values(data);
  return (result[0] as any)?.insertId || 0;
}

export async function getOutreachByProfessor(userId: number, professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(outreach)
    .where(and(eq(outreach.userId, userId), eq(outreach.professorId, professorId)))
    .limit(1);
  return result[0] || null;
}

export async function getUserOutreach(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(outreach).where(eq(outreach.userId, userId));
}

export async function updateOutreach(outreachId: number, data: Partial<InsertOutreach>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(outreach).set(data).where(eq(outreach.id, outreachId));
  const result = await db.select().from(outreach).where(eq(outreach.id, outreachId)).limit(1);
  return result[0];
}

// Professor Bookmarks
export async function toggleBookmark(userId: number, professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(professorBookmarks)
    .where(and(eq(professorBookmarks.userId, userId), eq(professorBookmarks.professorId, professorId)))
    .limit(1);

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(professorBookmarks)
      .where(and(eq(professorBookmarks.userId, userId), eq(professorBookmarks.professorId, professorId)));
    return false;
  } else {
    // Add bookmark
    await db.insert(professorBookmarks).values({ userId, professorId });
    return true;
  }
}

export async function getBookmarkedProfessors(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(professorBookmarks)
    .where(eq(professorBookmarks.userId, userId));
}

export async function isBookmarked(userId: number, professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(professorBookmarks)
    .where(and(eq(professorBookmarks.userId, userId), eq(professorBookmarks.professorId, professorId)))
    .limit(1);
  return result.length > 0;
}

// Professor Scores
export async function createOrUpdateProfessorScore(data: InsertProfessorScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(professorScores)
    .where(and(eq(professorScores.professorId, data.professorId), eq(professorScores.userId, data.userId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(professorScores)
      .set({ matchScore: data.matchScore, reasoning: data.reasoning })
      .where(and(eq(professorScores.professorId, data.professorId), eq(professorScores.userId, data.userId)));
    return existing[0].id;
  } else {
    const result = await db.insert(professorScores).values(data);
    return (result[0] as any)?.insertId || 0;
  }
}

export async function getProfessorScore(userId: number, professorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(professorScores)
    .where(and(eq(professorScores.userId, userId), eq(professorScores.professorId, professorId)))
    .limit(1);
  return result[0] || null;
}

// Follow-up Emails
export async function createFollowUpEmail(data: InsertFollowUpEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(followUpEmails).values(data);
  return (result[0] as any)?.insertId || 0;
}

export async function getFollowUpEmails(outreachId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(followUpEmails).where(eq(followUpEmails.outreachId, outreachId));
}

// Email Tone Preferences
export async function getOrCreateTonePreference(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(emailTonePreferences)
    .where(eq(emailTonePreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(emailTonePreferences).values({ userId, defaultTone: "formal" });
  const result = await db
    .select()
    .from(emailTonePreferences)
    .where(eq(emailTonePreferences.userId, userId))
    .limit(1);
  return result[0];
}

export async function updateTonePreference(userId: number, defaultTone: "formal" | "friendly" | "concise") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(emailTonePreferences)
    .set({ defaultTone })
    .where(eq(emailTonePreferences.userId, userId));

  const result = await db
    .select()
    .from(emailTonePreferences)
    .where(eq(emailTonePreferences.userId, userId))
    .limit(1);
  return result[0];
}
