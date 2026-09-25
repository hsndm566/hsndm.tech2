-- Applied to Supabase project ufyvelnxexjvlibhweau as migration v2_e2e_application_path.
-- Additive V2 acceptance-path schema only. Existing legacy/Clerk policies remain untouched.

alter table public.v2_profiles add column if not exists "targetRole" text;
alter table public.v2_profiles add column if not exists "experienceLevel" text;
alter table public.v2_profiles add column if not exists "resumeStoragePath" text;
alter table public.v2_profiles add column if not exists "resumeMimeType" text;
alter table public.v2_profiles add column if not exists "resumeSizeBytes" bigint;

alter table public.v2_applications add column if not exists "sourceUrl" text;
alter table public.v2_applications add column if not exists "providerMessageId" text;
alter table public.v2_applications add column if not exists "cvStoragePath" text;
alter table public.v2_applications add column if not exists "jobId" text;

create unique index if not exists v2_applications_owner_source_url_unique
  on public.v2_applications(user_id, "sourceUrl")
  where "sourceUrl" is not null;

create unique index if not exists v2_applications_provider_message_unique
  on public.v2_applications("providerMessageId")
  where "providerMessageId" is not null;

create or replace view public.v2_live_jobs
with (security_invoker = true)
as
select
  id::text as id,
  canonical_url as "canonicalUrl",
  company,
  title,
  location,
  description,
  last_seen_at as "lastSeenAt",
  verified_until as "verifiedUntil",
  verification
from autoapply_baseline.opportunities
where status = 'open'
  and verified_until > now();

revoke all on public.v2_live_jobs from public, anon;
grant usage on schema autoapply_baseline to authenticated;
grant select (id, canonical_url, company, title, location, description, last_seen_at, verified_until, verification, status)
  on autoapply_baseline.opportunities to authenticated;
grant select on public.v2_live_jobs to authenticated;

drop policy if exists "v2 candidate reads own cv" on storage.objects;
create policy "v2 candidate reads own cv"
on storage.objects for select to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "v2 candidate uploads own cv" on storage.objects;
create policy "v2 candidate uploads own cv"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'candidate-cvs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "v2 candidate updates own cv" on storage.objects;
create policy "v2 candidate updates own cv"
on storage.objects for update to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'candidate-cvs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "v2 candidate deletes own cv" on storage.objects;
create policy "v2 candidate deletes own cv"
on storage.objects for delete to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
