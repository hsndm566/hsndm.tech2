import { COOKIE_NAME } from "@shared/const";
import { ApplicationAccessScope, createCampaignEnquiry, createCampaignReadiness, deleteJobApplication, getAllJobApplications, getCandidateApplicationEvidence, getCandidateJobApplications, getCandidateProfile, getJobApplicationById, insertJobApplication, recordApplicationEvidence, updateCandidateProfile, updateJobApplication } from "./db";
import { z } from "zod";
import { campaignReadinessInputSchema } from "./campaignReadiness.schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { analyzeAts, atsInput } from "./ats";
import { invokeLLM } from "./_core/llm";
import { invokeGroqJson, isGroqConfigured } from "./groq";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyClientCvExtractionFailure, notifyClientWorkflowFallback, notifyOperationalFailure } from "./operationalAlerts";
import { nanoid } from "nanoid";

const keySkillsOutputSchema = z.object({
  keySkills: z.array(z.string().trim().min(1).max(80)).max(6),
  topDomain: z.string().trim().max(100),
});

const emptySkillsResult = { keySkills: [], topDomain: "" };

function getApplicationAccessScope(user: { openId: string; role: "user" | "admin" }): ApplicationAccessScope {
  return user.role === "admin" ? { kind: "admin" } : { kind: "candidate", candidateOpenId: user.openId };
}

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
          const messages = [
            { role: "system" as const, content: `Extract up to 6 explicit professional skills and one broad professional domain from the supplied CV text. Use only evidence in the text. Do not infer credentials, employers, seniority, or outcomes. Return JSON only. Write the skill labels and domain in ${input.language === "Arabic" ? "Arabic" : "English"}.` },
            { role: "user" as const, content: input.cvText }
          ];
          let content: string | undefined;
          if (isGroqConfigured()) {
            try {
              content = await invokeGroqJson({ messages, maxCompletionTokens: 400 });
            } catch {
              // Retain the established provider as a graceful recovery path.
            }
          }
          if (!content) {
            const res = await invokeLLM({
              model: "gpt-5-mini",
              max_tokens: 400,
              response_format: { type: "json_schema", json_schema: { name: "skills_result", strict: true, schema: { type: "object", properties: { keySkills: { type: "array", items: { type: "string" }, maxItems: 6 }, topDomain: { type: "string" } }, required: ["keySkills", "topDomain"], additionalProperties: false } } },
              messages,
            });
            const fallbackContent = res.choices[0]?.message?.content;
            if (typeof fallbackContent === "string") content = fallbackContent;
          }
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
    enquiry: router({
      submit: publicProcedure.input(z.object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(320),
        targetRole: z.string().trim().min(2).max(120),
        city: z.string().trim().min(2).max(64),
        industry: z.string().trim().min(2).max(100),
        language: z.enum(["English", "Arabic"]),
        campaignAuthorizationConfirmed: z.literal(true),
      })).mutation(async ({ input }) => {
        const reference = `AA-${nanoid(10).toUpperCase()}`;
        const createdAt = await createCampaignEnquiry({
          reference,
          fullName: input.fullName,
          email: input.email,
          targetRole: input.targetRole,
          city: input.city,
          industry: input.industry,
          language: input.language,
          campaignAuthorizationConfirmed: true,
        });
        if (!createdAt) throw new Error("Secure enquiry is temporarily unavailable. Please use email or WhatsApp instead.");
        return { reference, createdAt } as const;
      }),
    }),
    applications: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        if (user.role === "admin") {
          return await getAllJobApplications(); // Admins see all applications
        }
        return await getCandidateJobApplications(user.openId); // Candidates see only their own applications
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
      update: protectedProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            companyName: z.string().trim().min(2).max(255).optional(),
            roleTitle: z.string().trim().min(2).max(255).optional(),
            city: z.string().trim().min(2).max(120).optional(),
            status: z.enum(["queued", "applied", "interview", "offer", "skipped"]).optional(),
            notes: z.string().trim().max(2000).nullable().optional(),
          }).refine(
            ({ companyName, roleTitle, city, status, notes }) => [companyName, roleTitle, city, status, notes].some(value => value !== undefined),
            "Provide at least one application field to update."
          )
        )
        .mutation(async ({ input, ctx }) => {
          const { id, ...changes } = input;
          try {
            const updated = await updateJobApplication(id, getApplicationAccessScope(ctx.user), changes);
            if (!updated) throw new Error("Application not found or no longer available.");
            return { success: true, updated } as const;
          } catch (error) { await notifyOperationalFailure("application update", error); throw error; }
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          try {
            const deleted = await deleteJobApplication(input.id, getApplicationAccessScope(ctx.user));
            if (!deleted) throw new Error("Application not found or no longer available.");
            return { success: true } as const;
          } catch (error) { await notifyOperationalFailure("application deletion", error); throw error; }
        }),
      evidence: router({
        list: protectedProcedure.query(async ({ ctx }) => {
          if (ctx.user.role === "admin") return [];
          return getCandidateApplicationEvidence(ctx.user.openId);
        }),
        record: protectedProcedure
          .input(z.object({
            applicationId: z.number().int().positive(),
            evidenceType: z.enum(["portal_confirmation", "email_accepted", "employer_confirmation"]),
          }))
          .mutation(async ({ input, ctx }) => {
            if (ctx.user.role !== "admin") throw new Error("Only an authorized operator can record application evidence.");
            const application = await getJobApplicationById(input.applicationId, { kind: "admin" });
            if (!application) throw new Error("Application not found.");
            const recorded = await recordApplicationEvidence({
              applicationId: application.id,
              candidateOpenId: application.candidateOpenId,
              evidenceType: input.evidenceType,
            });
            if (!recorded) throw new Error("Evidence could not be recorded. Existing evidence is never overwritten.");
            return { success: true, recorded } as const;
          }),
      }),
      profile: router({
        get: protectedProcedure.query(async ({ ctx }) => {
          const profile = await getCandidateProfile(ctx.user.openId);
          if (!profile) throw new Error("Candidate profile is temporarily unavailable.");
          return profile;
        }),
        update: protectedProcedure
          .input(
            z.object({
              fullName: z.string().trim().max(120).optional(),
              phone: z.string().trim().max(64).optional(),
              preferredSeniority: z.enum(["Entry level", "Mid-level", "Senior", "Leadership"]).optional(),
              preferredLanguage: z.enum(["English", "Arabic"]).optional(),
              openToRemote: z.boolean().optional(),
              targetCity: z.string().trim().max(64).optional(),
              targetIndustry: z.string().trim().max(64).optional(),
              salaryExpectation: z.string().trim().max(64).optional(),
              resumeFileName: z.string().max(255).optional(),
              resumeSummary: z.string().max(500).optional(),
              notifyWhatsApp: z.boolean().optional(),
              notifyEmail: z.boolean().optional(),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const updated = await updateCandidateProfile(ctx.user.openId, input);
            if (!updated) throw new Error("Candidate profile could not be updated right now.");
            return { success: true, updated } as const;
          }),
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
