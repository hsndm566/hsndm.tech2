import { z } from "zod";

const cityValues = ["Jeddah", "Riyadh", "Dammam", "Makkah", "Madinah", "Anywhere in Saudi Arabia"] as const;
const industryValues = ["all", "technology-data", "business-operations", "people-service", "engineering-construction"] as const;
const seniorityValues = ["Any level", "Entry level", "Mid level", "Senior level"] as const;
const languageValues = ["English", "Arabic"] as const;

/** Only the voluntary campaign brief is stored. CV text and file bytes stay in the browser. */
export const campaignReadinessInputSchema = z.object({
  city: z.enum(cityValues),
  industry: z.enum(industryValues),
  seniority: z.enum(seniorityValues),
  language: z.enum(languageValues),
  targetRoles: z.array(z.string().trim().min(2).max(80)).min(1).max(3),
  primaryField: z.string().trim().min(2).max(100),
  cvReadable: z.literal(true),
  consent: z.literal(true),
  source: z.literal("landing-readiness-check"),
});

export type CampaignReadinessInput = z.infer<typeof campaignReadinessInputSchema>;
