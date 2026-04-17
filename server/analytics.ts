import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { searches, professors, outreach, emails } from "../drizzle/schema";
import { getDb } from "./db";

export interface AnalyticsData {
  totalProfessorsFound: number;
  totalEmailsSent: number;
  totalReplies: number;
  responseRate: number;
  meetingsScheduled: number;
  rejections: number;
  averageMatchScore: number;
  outreachByStatus: Record<string, number>;
}

export async function getAnalytics(userId: number): Promise<AnalyticsData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all searches for user
  const userSearches = await db.select().from(searches).where(eq(searches.userId, userId));
  const searchIds = userSearches.map((s) => s.id);

  let totalProfessorsFound = 0;
  let totalEmailsSent = 0;
  let totalReplies = 0;
  let meetingsScheduled = 0;
  let rejections = 0;

  if (searchIds.length > 0) {
    // Count professors found
    const allProfessors = await db.select().from(professors);
    totalProfessorsFound = allProfessors.filter((p) => searchIds.includes(p.searchId)).length;
  }

  // Get outreach stats
  const userOutreach = await db.select().from(outreach).where(eq(outreach.userId, userId));

  const statusCounts: Record<string, number> = {
    draft: 0,
    sent: 0,
    replied: 0,
    no_response: 0,
    meeting_scheduled: 0,
    rejected: 0,
  };

  for (const record of userOutreach) {
    statusCounts[record.status]++;
    if (record.status === "sent") totalEmailsSent++;
    if (record.status === "replied") totalReplies++;
    if (record.status === "meeting_scheduled") meetingsScheduled++;
    if (record.status === "rejected") rejections++;
  }

  const responseRate = totalEmailsSent > 0 ? Math.round((totalReplies / totalEmailsSent) * 100) : 0;

  return {
    totalProfessorsFound,
    totalEmailsSent,
    totalReplies,
    responseRate,
    meetingsScheduled,
    rejections,
    averageMatchScore: 0,
    outreachByStatus: statusCounts,
  };
}
