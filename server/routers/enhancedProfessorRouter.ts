import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  toggleBookmark,
  isBookmarked,
  createOrUpdateProfessorScore,
  getProfessorScore,
  createFollowUpEmail,
  getFollowUpEmails,
  getProfile,
} from "../db";
import {
  calculateMatchScore,
  generateEmailWithTone,
  generateFollowUpEmail,
} from "../professorSearch";
import { getAnalytics } from "../analytics";
import { TRPCError } from "@trpc/server";

export const enhancedProfessorRouter = router({
  /**
   * Toggle bookmark for a professor
   */
  toggleBookmark: protectedProcedure
    .input(z.object({ professorId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const isNowBookmarked = await toggleBookmark(ctx.user.id, input.professorId);
        return { bookmarked: isNowBookmarked };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle bookmark",
        });
      }
    }),

  /**
   * Check if professor is bookmarked
   */
  isBookmarked: protectedProcedure
    .input(z.object({ professorId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const bookmarked = await isBookmarked(ctx.user.id, input.professorId);
        return { bookmarked };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check bookmark status",
        });
      }
    }),

  /**
   * Calculate and save match score for a professor
   */
  calculateMatchScore: protectedProcedure
    .input(
      z.object({
        professorId: z.number(),
        professorResearch: z.string(),
        professorPapers: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const profile = await getProfile(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please complete your profile first",
          });
        }

        const { score, reasoning } = await calculateMatchScore(
          input.professorResearch,
          input.professorPapers,
          profile.researchInterests || "",
          profile.skills || ""
        );

        await createOrUpdateProfessorScore({
          professorId: input.professorId,
          userId: ctx.user.id,
          matchScore: score,
          reasoning,
        });

        return { score, reasoning };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate match score",
        });
      }
    }),

  /**
   * Get match score for a professor
   */
  getMatchScore: protectedProcedure
    .input(z.object({ professorId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const score = await getProfessorScore(ctx.user.id, input.professorId);
        return score;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch match score",
        });
      }
    }),

  /**
   * Generate email with specific tone
   */
  generateEmailWithTone: protectedProcedure
    .input(
      z.object({
        professorName: z.string(),
        professorResearch: z.string(),
        recentPapers: z.array(
          z.object({
            title: z.string(),
            year: z.number(),
          })
        ),
        researchInterest: z.string(),
        tone: z.enum(["formal", "friendly", "concise"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const profile = await getProfile(ctx.user.id);

        const emailContent = await generateEmailWithTone(
          input.professorName,
          input.professorResearch,
          input.recentPapers,
          input.researchInterest,
          input.tone,
          profile
            ? {
                fullName: profile.fullName || undefined,
                university: profile.university || undefined,
                major: profile.major || undefined,
                year: profile.year || undefined,
                gpa: profile.gpa || undefined,
                researchInterests: profile.researchInterests || undefined,
                skills: profile.skills || undefined,
                pastExperience: profile.pastExperience || undefined,
              }
            : undefined
        );

        return { content: emailContent };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate email with tone",
        });
      }
    }),

  /**
   * Generate follow-up email
   */
  generateFollowUp: protectedProcedure
    .input(
      z.object({
        outreachId: z.number(),
        professorName: z.string(),
        originalEmailSnippet: z.string(),
        tone: z.enum(["formal", "friendly", "concise"]),
        daysElapsed: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const emailContent = await generateFollowUpEmail(
          input.professorName,
          input.originalEmailSnippet,
          input.tone,
          input.daysElapsed
        );

        const followUpId = await createFollowUpEmail({
          outreachId: input.outreachId,
          emailContent,
          tone: input.tone,
          daysAfterOriginal: input.daysElapsed,
        });

        return { id: followUpId, content: emailContent };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate follow-up email",
        });
      }
    }),

  /**
   * Get follow-up emails for an outreach
   */
  getFollowUps: protectedProcedure
    .input(z.object({ outreachId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const followUps = await getFollowUpEmails(input.outreachId);
        return followUps;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch follow-up emails",
        });
      }
    }),

  /**
   * Get analytics dashboard data
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const analytics = await getAnalytics(ctx.user.id);
      return analytics;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch analytics",
      });
    }
  }),
});
