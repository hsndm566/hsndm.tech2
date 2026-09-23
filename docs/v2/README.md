# AutoApply SA V2 preview

Branch: autoapply-v2-preview in hsndm566/hsndm.tech2. Production traffic has not been switched.

## Implemented
- English and Arabic landing, CV text extraction, interactive source belt and range control, product illustrations, existing walkthrough video, responsive layouts.
- Supabase-only customer auth UI, email signup/login, recovery, OAuth callback, protected routes, session timeout recovery.
- Separate v2_profiles and v2_applications in the existing autoapply-sa-phase1-dev Supabase project. Applied migration autoapply_v2_private_workspace. RLS restricts select/insert/update by auth.uid(). V2 customer authentication uses Supabase only.
- V2 dashboard uses these protected Supabase tables directly. MySQL/tRPC backend remains for existing backend features and receives Supabase authentication when configured.
- Manual application tracker, editable statuses including rejection, profile onboarding, Saudi week boundary and dates, CV analysis retained across redirect in session storage.

## Validation
- TypeScript check passes.
- 229 tests pass, 7 existing tests skipped. 19 obsolete V1 source-contract test files are retained under legacy-tests rather than claiming they test the replacement UI. Current backend tests remain active.
- Static production build passes.
- Transactional development database checks verified own profile/application access, blocked cross-account reads/inserts and ownership reassignment. Test records rolled back.
- Database advisors found no issues for the two new V2 tables; legacy project findings remain outside this migration.

## Configuration
Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at build time. Use the publishable key, never a service-role key. Development project URL: https://ufyvelnxexjvlibhweau.supabase.co.
Enable Google in Supabase Auth and allow the final preview origin's /auth/callback, /ar/auth/callback, /reset-password and /ar/reset-password redirect URLs. Live provider login and emailed recovery are not yet verified.

## Remaining release gates
- End-to-end signup, verification email, Google OAuth and recovery on the final preview origin.
- Legacy identity ownership migration must use reviewed server-side mapping; no automatic email matching.
- Real job discovery, tailoring, application submission and billing remain unconnected. Authenticated routes do not create synthetic activity or send applications.
- No Sites deployment has been created because Sites provisions a separate source repository and the directive prohibits creating another repository. The implementation stays in the requested GitHub repository.
- Full comparison to all reference-page sections at all requested viewport sizes remains incomplete. Current checks establish rendering and basic interactions, not pixel-level equivalence.

## Development
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build:pages

client/v2-qa.html is a development-only iframe harness for 390/430/768/1280/1440px viewport inspection. It is not emitted by the Vite production entry.
