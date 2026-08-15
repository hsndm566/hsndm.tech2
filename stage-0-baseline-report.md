# AutoApply SA — Stage 0 Baseline and Safety Inventory Report

## 1. Access and Inspection Scope

- **Repository and Codebase:** Fully accessible in sandbox at `/home/ubuntu/hsndm-enhanced`.
- **Technology Stack:** React 19, Vite 7, Tailwind CSS 4, Express 4, tRPC 11, Drizzle ORM (MySQL), and Clerk React/Backend SDKs.
- **Hosting and Deployment:** Managed Manus cloud preview and managed deployment (`hsndmstudio-lyaavagg.manus.space`). External DNS bindings (`hsndm.tech` and `dashboard.hsndm.tech`) and Clerk custom domain verification (`clerk.hsndm.tech`) require external operator DNS management.

---

## 2. Existing Pages, Routes, and User Journeys

- **Public English Landing Page (`/`):** Features brand positioning centered exclusively on Saudi Arabia (Jeddah-based), dual video loops (hero background and explainer), stats ticker, interactive Saudi career matcher with industry/city filters, CV drop zone with adrenaline progress bar and transient local extraction, WhatsApp enquiry handoff, map, FAQs, pricing tiers, and real customer reviews.
- **Public Arabic Landing Page (`/ar`):** Full RTL mirror of the English landing page with localized Arabic copy, localized job categories, and Arabic WhatsApp prefill.
- **Dedicated Enquiry Flow (`/enquire` and `/ar/enquire`):** Streamlined intake forms connecting campaign readiness directly to WhatsApp API prefilled messages.
- **ATS Checker (`/ats`):** Client-side CV scoring and gap analysis against Saudi ATS thresholds, with re-upload loops and pricing callouts.
- **Private Candidate Dashboard (`/dashboard` and `/dashboard/settings`):** Secure candidate portal featuring Clerk authentication fallback, campaign health score, application tracking feed with version tagging (`v1`, `v2`), recent activity feed with unread notification badge and preview dropdown, and candidate profile settings with undoable toast feedback.

---

## 3. Technology, Data, and Integrations Inventory

- **Frontend Architecture:** Component-driven React architecture styled with Tailwind CSS 4 and shadcn/ui primitives.
- **Backend Architecture:** Express server with tRPC routers (`server/routers.ts`), Drizzle ORM (`drizzle/schema.ts`), and secure database helpers (`server/db.ts`).
- **Data Privacy & Storage:** Zero server-side storage of raw candidate CV files or text; transient AI extraction via `gpt-5-mini` using only browser-extracted text snippets. S3 storage proxies are configured for static media assets.
- **Authentication & Security:** Dual-mode auth supporting Manus OAuth and Clerk Passwordless email authentication with bearer-token fallback in tRPC context.

---

## 4. Conversion Actions and Critical Flows

1. **CV Drop & Career Matching:** Drop/select CV -> local client-side extraction -> adrenaline progress animation -> ranked Saudi target roles with confidence tags and open-role volume estimates.
2. **Campaign Readiness & WhatsApp Handoff:** Complete readiness form -> smooth loading animation -> prefilled WhatsApp chat handoff.
3. **Candidate Dashboard Tracking:** Authenticate via Clerk -> view campaign health score, application status timeline, CV version tags, unread activity notifications, and profile settings with undo.

---

## 5. Visual System and Responsive Behavior

- **Design Tokens:** Strict black/white monochrome brand ink (`#0a0a0a` / `#fafafa`), Inter typography, single-accent operational vermilion/green interactive states.
- **Responsive Layouts:** Mobile-first architecture with stacked headers, responsive grid columns, and sticky mobile CTAs.
- **Motion & Accessibility:** Lightweight CSS transitions, explicit loading/error states, and media playback fallback controls.

---

## 6. Identified Risks

1. **External DNS & Domain Binding:** `dashboard.hsndm.tech` currently resolves to GitHub Pages (404) rather than the managed deployment, and live Clerk passwordless sign-in depends on external DNS propagation for `clerk.hsndm.tech`.
2. **Browser Extension Timeouts:** Direct automated browser interactions are occasionally subject to environment extension timeouts, requiring manual user take-over or independent API/smoke verification.
3. **Database Migration Sync:** Ensuring Drizzle schema additions (such as profile settings and application timestamps) remain strictly synchronized with production MySQL schema migrations.

---

## 7. Top Five Proposed Improvements

| Improvement | Expected User Impact | Implementation Risk | Dependencies |
|---|---|---|---|
| **1. Guided DNS Setup Guide** | Simplifies custom domain and Clerk DNS propagation for the operator. | Low | None |
| **2. Enhanced Form Error Recovery** | Improves user confidence during slow or unreliable network conditions. | Low | None |
| **3. Automated Health Monitoring** | Ensures uptime tracking via the provider-agnostic `/healthz` endpoint. | Low | None |
| **4. Expanded Accessibility Auditing** | Guarantees screen reader compatibility and keyboard navigation across all views. | Low | None |
| **5. Client-Side PDF Summary Export** | Empowers candidates to download their active campaign brief offline. | Low | None |

---

*Stage 0 inventory complete. Awaiting user approval to proceed to Stage 1.*
