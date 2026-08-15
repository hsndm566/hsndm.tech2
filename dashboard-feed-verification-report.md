# Dashboard Data Fetching & Feed Verification Report

**Date:** August 15, 2026  
**Scope:** Verification of the data-fetching pathway from `api.hsndm.tech` (and the backend tRPC gateway) to the candidate dashboard (`/dashboard` and `/dashboard/settings`), ensuring application tracking feeds and candidate profiles populate correctly after login.

---

## Architecture & Data Flow Verification

1. **Authentication & Token Forwarding (`main.tsx` & `context.ts`):**
   - When a candidate logs in via Clerk passwordless email on the dashboard, the tRPC client retrieves the active Clerk session token (`getClerkToken()`).
   - Every tRPC query (`httpBatchLink`) forwards this token as an `Authorization: Bearer <token>` header.
   - On the backend, `server/_core/context.ts` runs `authenticateClerkRequest(...)` using `@clerk/backend`, mapping the Clerk user ID (`sub`) to an internal database openId (`clerk:${sub}`) and auto-upserting the user record.

2. **Query Gating & Safety (`Dashboard.tsx`):**
   - Dashboard data queries (`campaign.applications.list` and `campaign.applications.profile.get`) are strictly gated by `enabled: dashboardAuthenticated`.
   - Once authenticated (`clerkAuth.isSignedIn === true`), the queries fire against `/api/trpc`.

3. **Backend Procedures (`routers.ts` & `db.ts`):**
   - **`campaign.applications.list` (`protectedProcedure`):** Automatically scopes applications to the logged-in candidate's openId, preventing cross-tenant data leaks.
   - **`campaign.applications.profile.get` (`protectedProcedure`):** Retrieves or auto-initializes the candidate's Saudi job preferences and contact info.
   - **Recent Activity & Skeleton UI:** If applications are present, the dashboard builds a dynamic activity feed (`buildRecentActivity`) combining submission timestamps, status updates, and profile timestamps. If 0 applications exist, the UI gracefully renders an honest empty-account onboarding card rather than throwing an error.

---

## Conclusion
The data-fetching pipeline is fully wired end-to-end. As soon as a candidate successfully authenticates through the Clerk passwordless flow on the dashboard, the frontend attaches their valid Bearer token, the backend authenticates their session, and tRPC successfully populates the application-tracking feed and profile settings.
