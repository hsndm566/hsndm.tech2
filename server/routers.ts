import { COOKIE_NAME } from "@shared/const";
import { createCampaignReadiness, getJobApplications, insertJobApplication } from "./db";
import { z } from "zod";
import { campaignReadinessInputSchema } from "./campaignReadiness.schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  }),
  campaign: router({
    readiness: router({
      record: publicProcedure.input(campaignReadinessInputSchema).mutation(async ({ input }) => {
        const stored = await createCampaignReadiness({
          ...input,
          consented: input.consent,
        });
        return { stored } as const;
      }),
    }),
    applications: router({
      list: publicProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        if (!user) {
          return []; // Unauthenticated users see empty feed
        }
        if (user.role === "admin") {
          return await getJobApplications(); // Admins see all applications
        }
        return await getJobApplications(user.openId); // Candidates see only their own applications
      }),
      create: publicProcedure
        .input(
          z.object({
            candidateName: z.string().min(2),
            candidateEmail: z.string().email().optional().or(z.literal("")),
            candidatePhone: z.string().optional(),
            companyName: z.string().min(2),
            roleTitle: z.string().min(2),
            city: z.string().min(2),
            status: z.enum(["queued", "applied", "interview", "offer", "skipped"]).default("applied"),
            channel: z.string().default("email-portal"),
            notes: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const created = await insertJobApplication(input);
          return { success: true, created } as const;
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
