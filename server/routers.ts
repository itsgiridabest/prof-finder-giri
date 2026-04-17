import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { professorRouter } from "./routers/professorRouter";
import { enhancedProfessorRouter } from "./routers/enhancedProfessorRouter";
import { profileRouter } from "./routers/profileRouter";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    checkAccess: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.openId !== ENV.ownerOpenId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied. This app is for Giri only.",
        });
      }
      return { allowed: true };
    }),
  }),

  professor: professorRouter,
  enhanced: enhancedProfessorRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
