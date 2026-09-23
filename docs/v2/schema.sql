begin;
create table public.v2_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 "fullName" text not null check(char_length("fullName") between 2 and 120),
 "targetCity" text not null default 'Jeddah',
 "targetIndustry" text not null check(char_length("targetIndustry") between 1 and 64),
 "preferredLanguage" text not null default 'English' check("preferredLanguage" in ('English','Arabic')),
 "openToRemote" boolean not null default false,
 "resumeFileName" text check(char_length("resumeFileName") <= 255),
 "resumeSummary" text check(char_length("resumeSummary") <= 500)
);
create table public.v2_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 "companyName" text not null check(char_length("companyName") between 2 and 150),
 "roleTitle" text not null check(char_length("roleTitle") between 2 and 150),
 city text not null,
 status text not null default 'queued' check(status in ('queued','applied','interview','offer','rejected','skipped')),
 "appliedAt" timestamptz,
 "updatedAt" timestamptz not null default now(),
 "createdAt" timestamptz not null default now()
);
create index v2_applications_owner_updated on public.v2_applications(user_id,"updatedAt" desc);
alter table public.v2_profiles enable row level security;
alter table public.v2_applications enable row level security;
revoke all on public.v2_profiles, public.v2_applications from anon, authenticated;
grant select, insert, update on public.v2_profiles, public.v2_applications to authenticated;
create policy v2_profile_read on public.v2_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy v2_profile_insert on public.v2_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy v2_profile_update on public.v2_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy v2_application_read on public.v2_applications for select to authenticated using ((select auth.uid())=user_id);
create policy v2_application_insert on public.v2_applications for insert to authenticated with check ((select auth.uid())=user_id);
create policy v2_application_update on public.v2_applications for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
commit;
