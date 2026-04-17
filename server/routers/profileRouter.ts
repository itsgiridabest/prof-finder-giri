import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getOrCreateProfile,
  updateProfile,
  getProfile,
  getUserOutreach,
  createOutreach,
  updateOutreach,
  getOutreachByProfessor,
} from "../db";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
  /**
   * Get or create user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await getProfile(ctx.user.id);
      if (!profile) {
        return await getOrCreateProfile(ctx.user.id);
      }
      return profile;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch profile",
      });
    }
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        university: z.string().optional(),
        major: z.string().optional(),
        year: z.string().optional(),
        gpa: z.string().optional(),
        researchInterests: z.string().optional(),
        skills: z.string().optional(),
        pastExperience: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const profile = await updateProfile(ctx.user.id, input);
        if (!profile) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profile",
          });
        }
        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  /**
   * Get user's outreach tracker
   */
  getOutreach: protectedProcedure.query(async ({ ctx }) => {
    try {
      const outreachList = await getUserOutreach(ctx.user.id);
      return outreachList;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch outreach tracker",
      });
    }
  }),

  /**
   * Create outreach record for a professor
   */
  createOutreach: protectedProcedure
    .input(
      z.object({
        professorId: z.number(),
        emailId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if outreach already exists
        const existing = await getOutreachByProfessor(ctx.user.id, input.professorId);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Outreach record already exists for this professor",
          });
        }

        const outreachId = await createOutreach({
          userId: ctx.user.id,
          professorId: input.professorId,
          emailId: input.emailId,
          status: "draft",
        });

        return { id: outreachId, success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create outreach record",
        });
      }
    }),

  /**
   * Update outreach status
   */
  updateOutreach: protectedProcedure
    .input(
      z.object({
        outreachId: z.number(),
        status: z.enum(["draft", "sent", "replied", "no_response", "meeting_scheduled", "rejected"]),
        sentAt: z.date().optional(),
        repliedAt: z.date().optional(),
        notes: z.string().optional(),
        followUpReminder: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await updateOutreach(input.outreachId, {
          status: input.status,
          sentAt: input.sentAt,
          repliedAt: input.repliedAt,
          notes: input.notes,
          followUpReminder: input.followUpReminder,
        });

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Outreach record not found",
          });
        }

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update outreach record",
        });
      }
    }),
});
