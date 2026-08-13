import { COOKIE_NAME } from "@shared/const";
import { createCampaignReadiness, getJobApplications, insertJobApplication, getCandidateProfile, updateCandidateProfile } from "./db";
import { z } from "zod";
import { campaignReadinessInputSchema } from "./campaignReadiness.schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { analyzeAts, atsInput } from "./ats";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyClientCvExtractionFailure, notifyClientWorkflowFallback, notifyOperationalFailure } from "./operationalAlerts";

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
    clientIssue: router({
      reportBlockedWhatsAppHandoff: publicProcedure
        .input(z.object({ route: z.enum(["/", "/ar", "/enquire", "/ar/enquire"]) }))
        .mutation(async ({ input }) => ({ delivered: await notifyClientWorkflowFallback(input.route) })),
      reportCvExtractionFailure: publicProcedure
        .input(z.object({ route: z.enum(["/", "/ar", "/ats"]) }))
        .mutation(async ({ input }) => ({ delivered: await notifyClientCvExtractionFailure(input.route) })),
    }),
    ats: router({ analyze: publicProcedure.input(atsInput).mutation(async ({ input }) => {
      try { return await analyzeAts(input); } catch (error) { await notifyOperationalFailure("ATS analysis", error); throw error; }
    }) }),
    readiness: router({
      record: publicProcedure.input(campaignReadinessInputSchema).mutation(async ({ input }) => {
        try {
          const stored = await createCampaignReadiness({ ...input, consented: input.consent });
          if (!stored) throw new Error("campaign readiness record was not persisted");
          return { stored } as const;
        } catch (error) { await notifyOperationalFailure("campaign readiness", error); throw error; }
      }),
    }),
    applications: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        if (user.role === "admin") {
          return await getJobApplications(); // Admins see all applications
        }
        return await getJobApplications(user.openId); // Candidates see only their own applications
      }),
      create: protectedProcedure
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
        .mutation(async ({ input, ctx }) => {
          try {
            const candidateOpenId = ctx.user.openId;
            const created = await insertJobApplication({ ...input, candidateOpenId });
            if (!created) throw new Error("application record was not persisted");
            return { success: true, created } as const;
          } catch (error) { await notifyOperationalFailure("application creation", error); throw error; }
        }),
      profile: router({
        get: protectedProcedure.query(async ({ ctx }) => {
          return await getCandidateProfile(ctx.user.openId);
        }),
        update: protectedProcedure
          .input(
            z.object({
              targetCity: z.string().optional(),
              targetIndustry: z.string().optional(),
              salaryExpectation: z.string().optional(),
              notifyWhatsApp: z.boolean().optional(),
              notifyEmail: z.boolean().optional(),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const updated = await updateCandidateProfile(ctx.user.openId, input);
            return { success: true, updated } as const;
          }),
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
