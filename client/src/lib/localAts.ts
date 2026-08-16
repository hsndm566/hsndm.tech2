export type AtsReview = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  optimizedBullets: string[];
  disclaimer: string;
};

const has = (text: string, expression: RegExp) => expression.test(text);

/**
 * A transparent, deterministic fallback for the public ATS preview. It never
 * invents qualifications and keeps a useful review available if the remote
 * AI endpoint is unavailable.
 */
export function createLocalAtsReview(cvText: string, targetRole = ""): AtsReview {
  const text = cvText.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 42;

  if (has(lower, /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)) {
    score += 8;
    strengths.push("A readable email contact is present.");
  } else {
    gaps.push("Add a professional email address near the top of the CV.");
  }
  if (has(lower, /\b(experience|education|skills|summary|profile|work history)\b/i)) {
    score += 12;
    strengths.push("The CV includes standard section language that ATS tools can recognise.");
  } else {
    gaps.push("Use clear headings such as Experience, Education, and Skills.");
  }
  if (has(lower, /\b(react|typescript|javascript|node|python|sql|excel|sap|aws|azure|salesforce|project management)\b/i)) {
    score += 10;
    strengths.push("The CV contains specific, searchable skill keywords.");
  } else {
    gaps.push("List the tools, systems, and professional methods you actually use.");
  }
  if (has(lower, /\b\d+(?:\.\d+)?%\b|\b\d+\s*(?:users|customers|projects|team members|hours|sar)\b/i)) {
    score += 10;
    strengths.push("There is evidence of measurable scope or outcomes.");
  } else {
    gaps.push("Add truthful metrics that show scope, time saved, revenue, quality, or volume.");
  }
  if (targetRole && targetRole.length > 3) {
    score += 5;
    strengths.push("A target role or market context is selected for the review.");
  }

  score = Math.max(35, Math.min(92, score));
  const optimizedBullets = [
    "Use: Action + task + tool or method + truthful outcome.",
    "Mirror the exact job-title keywords that genuinely match your experience.",
    "Keep dates, job titles, employers, and core skills in plain selectable text.",
  ];

  return {
    score,
    summary: `This local ATS preview found ${strengths.length} readable strength${strengths.length === 1 ? "" : "s"} and ${gaps.length} priority improvement${gaps.length === 1 ? "" : "s"}${targetRole ? ` for ${targetRole}` : ""}.`,
    strengths: strengths.length ? strengths.slice(0, 4) : ["The CV text is readable and ready for a structured review."],
    gaps: gaps.length ? gaps.slice(0, 4) : ["Tailor the opening summary and skills order to each real job description."],
    optimizedBullets,
    disclaimer: "This is a local, rule-based preview. It does not predict hiring outcomes or invent qualifications.",
  };
}
