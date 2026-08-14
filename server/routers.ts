import { COOKIE_NAME } from "@shared/const";
import { createCampaignReadiness, getJobApplications, insertJobApplication, getCandidateProfile, updateCandidateProfile } from "./db";
import { z } from "zod";
import { campaignReadinessInputSchema } from "./campaignReadiness.schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { analyzeAts, atsInput } from "./ats";
import { invokeLLM } from "./_core/llm";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyClientCvExtractionFailure, notifyClientWorkflowFallback, notifyOperationalFailure } from "./operationalAlerts";

const keySkillsOutputSchema = z.object({
  keySkills: z.array(z.string().trim().min(1).max(80)).max(6),
  topDomain: z.string().trim().max(100),
});

const emptySkillsResult = { keySkills: [], topDomain: "" };

// The CV text is received only for this transient extraction request; no file or text is persisted.

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
    ats: router({
      analyze: publicProcedure.input(atsInput).mutation(async ({ input }) => {
        try { return await analyzeAts(input); } catch (error) { await notifyOperationalFailure("ATS analysis", error); throw error; }
      }),
      extractSkills: publicProcedure.input(z.object({ cvText: z.string().min(50).max(12000), language: z.enum(["English", "Arabic"]).default("English") })).mutation(async ({ input }) => {
        try {
          const res = await invokeLLM({
            model: "gpt-5-mini",
            max_tokens: 400,
            response_format: { type: "json_schema", json_schema: { name: "skills_result", strict: true, schema: { type: "object", properties: { keySkills: { type: "array", items: { type: "string" }, maxItems: 6 }, topDomain: { type: "string" } }, required: ["keySkills", "topDomain"], additionalProperties: false } } },
            messages: [
              { role: "system", content: `Extract up to 6 explicit professional skills and one broad professional domain from the supplied CV text. Use only evidence in the text. Do not infer credentials, employers, seniority, or outcomes. Return JSON only. Write the skill labels and domain in ${input.language === "Arabic" ? "Arabic" : "English"}.` },
              { role: "user", content: input.cvText }
            ],
          });
          const content = res.choices[0]?.message?.content;
          if (typeof content !== "string") return emptySkillsResult;
          return keySkillsOutputSchema.parse(JSON.parse(content));
        } catch {
          return emptySkillsResult;
        }
      }),
    }),
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
              resumeFileName: z.string().max(255).optional(),
              resumeSummary: z.string().max(500).optional(),
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
