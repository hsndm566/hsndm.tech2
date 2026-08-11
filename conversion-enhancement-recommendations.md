# AutoApply SA Conversion Enhancement Roadmap

**Scope:** Recommendations only. No website changes have been made.

## Executive recommendation

The strongest next enhancement is **not** a conventional free trial where applications are sent for free. Instead, AutoApply SA should offer a bounded, one-minute **Saudi Campaign Readiness Check**. It would show a visitor what the system sees in their CV and preferences, give them a practical campaign-preview artifact, and make the handoff to WhatsApp feel earned rather than abrupt. It uses assets and matching logic the site already has, avoids promising an interview or real applications, and keeps the service honest about what happens before payment.

This direction mirrors a useful pattern in career products: offer a specific diagnostic before asking someone to commit to a fuller service. Career.io promotes a free resume review with actionable feedback, while The Ladders specifies its review outputs such as ATS analysis, keyword analysis, and concrete feedback. Indeed’s Career Scout makes the initial experience more valuable as the job seeker supplies richer personal context. [1] [2] [3]

> **Positioning:** “See your Saudi campaign direction in 60 seconds. No applications sent. No card required.”

## Recommended priority order

| Priority | Enhancement | Why it matters | Effort | Risk to manage |
| --- | --- | --- | --- | --- |
| 1 | **Saudi Campaign Readiness Check** | Converts the existing CV matcher into a clear, personal pre-purchase result. | Low–medium | Must state that it is a diagnostic, not a real job application or live vacancy promise. |
| 2 | **First 24-hour campaign promise panel** | Removes uncertainty after a visitor chooses a plan by showing what happens next. | Low | Do not promise activities the team cannot reliably complete. |
| 3 | **Weekly activity report preview** | Makes “weekly report” and “daily report” tangible without inventing customer results. | Low | Use a labelled template, not fabricated customer data or outcomes. |
| 4 | **Plan-fit selector** | Helps a visitor understand Starter vs Pro vs Founder based on search urgency and role breadth. | Low–medium | Position it as guidance, not a claim that one plan guarantees a result. |
| 5 | **Pilot cohort offer** | Lets the team learn from a limited, real first group and later publish consented evidence. | Medium | Keep the cohort genuinely limited, document terms, and do not create synthetic testimonials. |
| 6 | **Privacy and consent micro-flow** | Reduces hesitation around CV uploading and WhatsApp handoff. | Low | Match any stated deletion, retention, or consent promise to the real operating process. |

## The best “trial”: Saudi Campaign Readiness Check

The current landing page already lets visitors choose a city, industry, seniority, language, and CV. The next iteration should package that interaction as a valuable endpoint rather than only an input step.

| Check output | What the visitor sees | Why it helps conversion |
| --- | --- | --- |
| **Detected role lanes** | Two or three role families derived from the existing local matcher. | Proves that the CV interaction is personalised. |
| **Campaign direction** | Their selected Saudi city, industry, seniority, and language in a compact “brief.” | Shows that AutoApply SA understands the candidate’s search constraints. |
| **Readiness checklist** | Plain-language prompts such as “target city selected,” “seniority selected,” and “CV text readable.” | Gives a useful next action without pretending to grade the candidate’s employability. |
| **What happens after approval** | A three-step flow: confirm brief → campaign setup → first activity update. | Removes operational ambiguity before purchase. |
| **Next step** | “Send this brief to Hasan on WhatsApp” with the result prefilled. | Lets a visitor carry their context into the human handoff. |

The key copy needs to be direct: **“Preview only: no applications are submitted during this check. Your CV is read in this browser unless you choose to share it with the team.”** The output should never list made-up vacancies, predict interview likelihood, or say that a role is live unless a real, current role source is connected.

## What should replace a generic free trial

A generic “7-day free trial” would create a mismatch with the business model because the core service involves real operational work: targeting, tailoring, email or portal submission, and follow-up. It risks generating high-support, low-intent demand and could make the paid offer feel less credible. A campaign diagnostic gives visitors a genuine benefit while reserving real operational work for a confirmed campaign.

A separate **pilot cohort** can be worthwhile, but it should be framed as a learning program rather than a permanent free plan. For example, a limited number of opt-in job seekers in one role family could receive a defined campaign package in exchange for structured feedback and explicit permission to use anonymised outcomes. The site should never use the pilot to manufacture reviews, ratings, or success claims.

## Supporting improvements

### 1. Make the first 24 hours concrete

Place a compact panel beside every “Choose plan” action:

> **After you start:** 1) confirm your target brief on WhatsApp, 2) validate the campaign direction, 3) receive your agreed first activity update.

This should follow the current one-business-day response commitment and only include operational promises that can be delivered consistently.

### 2. Show an honest report template

The pricing section mentions weekly and daily reports but visitors cannot picture them. Add a clearly labelled **“example report format”** showing fields such as campaign direction, applications prepared, submissions completed, follow-ups due, and questions for the candidate. Leave values blank or use labels; do not seed it with fabricated counts, statuses, or outcomes.

### 3. Add a plan-fit helper instead of more pricing copy

The three price points are clear, but a short selector can remove decision friction:

| Visitor situation | Suggested prompt |
| --- | --- |
| One target role, steady pace | “Start focused with one role lane.” |
| Several relevant role families or active search | “Choose a broader multi-channel campaign.” |
| Career move needing a higher-touch setup | “Discuss a more guided campaign.” |

The final prompt should invite a WhatsApp conversation rather than auto-select a paid plan.

### 4. Strengthen the WhatsApp handoff

The site already has a direct WhatsApp route. The readiness check should prefill a compact campaign brief rather than a generic opening line. A useful message would include city, industry, seniority, language, detected role lanes, and a consent line confirming the visitor wants to discuss a campaign. This eliminates repetition and lets Hasan respond with context.

### 5. Turn privacy into an observable choice

The page already says that CV data is not sold and that deletion can be requested. Add an optional consent line at the handoff explaining whether the visitor is sharing only a brief or also their CV. The operational process should support the exact wording before this is published.

## Measurement plan before any major redesign

The site already tracks campaign CTAs and back-to-top interaction. The next test should add only a few purpose-built events:

| Event | What it answers |
| --- | --- |
| `readiness_check_started` | Are visitors willing to begin a personal preview? |
| `readiness_check_completed` | Is the interaction clear enough to finish? |
| `campaign_brief_shared` | Does the preview improve qualified WhatsApp handoffs? |
| `plan_fit_opened` | Are visitors uncertain about which plan fits them? |
| `price_to_brief_handoff` | Does the pricing section lead to a meaningful next step? |

Run the preview alongside the current flow for at least two weeks before deciding whether it improves qualified campaign conversations. Compare completed checks, brief shares, and actual WhatsApp follow-ups—not interview outcomes, which depend on many external factors.

## Suggested decision

Approve **Option A** first: build the Saudi Campaign Readiness Check as a transparent preview within the existing CV interaction. It is the best combination of clarity, trust, and implementation leverage. Keep a pilot cohort as **Option B**, to be designed only after the team decides its capacity, eligibility criteria, consent terms, and feedback process.

## References

[1] [Career.io — career tools and free resume review](https://career.io/)

[2] [Indeed Career Scout — personalised career guidance](https://www.indeed.com/careerscout)

[3] [The Ladders — free professional resume review](https://www.theladders.com/resume-services/free-resume-review)
