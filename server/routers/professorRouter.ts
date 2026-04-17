import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createSearch,
  getUserSearches,
  getSearchById,
  createProfessor,
  getProfessorsBySearchId,
  createEmail,
  getEmailByProfessorId,
  updateEmail,
  getProfile,
} from "../db";
import {
  searchProfessorsWithAI,
  generatePersonalizedEmail,
} from "../professorSearch";
import { TRPCError } from "@trpc/server";

export const professorRouter = router({
  /**
   * Search for professors in a research field
   * Saves search to database and returns found professors
   */
  searchProfessors: protectedProcedure
    .input(
      z.object({
        researchField: z.string().min(1, "Research field is required"),
        universityPreference: z.string().optional(),
        locationPreference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create search record
        const search = await createSearch(
          ctx.user.id,
          input.researchField,
          input.universityPreference,
          input.locationPreference
        );

        if (!search) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create search record",
          });
        }

        // Use AI to find professors
        const professors = await searchProfessorsWithAI(
          input.researchField,
          input.universityPreference,
          input.locationPreference
        );

        // Save professors to database
        const savedProfessors: number[] = [];
        for (const prof of professors) {
          const result = await createProfessor({
            searchId: search,
            name: prof.name,
            university: prof.university,
            department: prof.department,
            researchInterests: prof.researchInterests,
            recentPapers: JSON.stringify(prof.recentPapers),
            contactEmail: prof.contactEmail,
            profileUrl: prof.profileUrl,
          });
          savedProfessors.push(result);
        }

        return {
          searchId: search,
          professors: professors.map((prof, idx) => ({
            ...prof,
            id: savedProfessors[idx] || 0,
          })),
        };
      } catch (error) {
        console.error("Professor search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to search for professors",
        });
      }
    }),

  /**
   * Get professors from a previous search
   */
  getProfessorsFromSearch: protectedProcedure
    .input(z.object({ searchId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify search belongs to user
        const search = await getSearchById(input.searchId);
        if (!search || search.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Search not found or access denied",
          });
        }

        const professors = await getProfessorsBySearchId(input.searchId);

        return professors.map((prof) => ({
          ...prof,
          recentPapers: JSON.parse(prof.recentPapers || "[]"),
        }));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch professors",
        });
      }
    }),

  /**
   * Get user's search history
   */
  getSearchHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const searches = await getUserSearches(ctx.user.id);
      return searches;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch search history",
      });
    }
  }),

  /**
   * Generate personalized email for a professor
   */
  generateEmail: protectedProcedure
    .input(
      z.object({
        professorId: z.number(),
        professorName: z.string(),
        professorResearch: z.string(),
        recentPapers: z.array(
          z.object({
            title: z.string(),
            year: z.number(),
          })
        ),
        researchInterest: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch user's profile to personalize email
        const profile = await getProfile(ctx.user.id);
        
        // Generate email using AI with profile context
        const emailContent = await generatePersonalizedEmail(
          input.professorName,
          input.professorResearch,
          input.recentPapers,
          input.researchInterest,
          profile ? {
            fullName: profile.fullName || undefined,
            university: profile.university || undefined,
            major: profile.major || undefined,
            year: profile.year || undefined,
            gpa: profile.gpa || undefined,
            researchInterests: profile.researchInterests || undefined,
            skills: profile.skills || undefined,
            pastExperience: profile.pastExperience || undefined,
          } : undefined
        );

        // Save email to database
        const email = await createEmail({
          professorId: input.professorId,
          originalContent: emailContent,
        });

        return {
          id: email,
          content: emailContent,
        };
      } catch (error) {
        console.error("Email generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate email",
        });
      }
    }),

  /**
   * Get email for a professor
   */
  getEmail: protectedProcedure
    .input(z.object({ professorId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const email = await getEmailByProfessorId(input.professorId);
        return email || null;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch email",
        });
      }
    }),

  /**
   * Update email content (user edits)
   */
  updateEmail: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        editedContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await updateEmail(input.emailId, input.editedContent);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update email",
        });
      }
    }),
});
