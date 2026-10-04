-- Metered application credits and private verified employer contacts for V2.
create table if not exists public.v2_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_key text not null default 'free' check (plan_key in ('free','starter','pro','custom')),
  application_limit integer not null default 5 check (application_limit >= 0),
  applications_used integer not null default 0 check (applications_used >= 0),
  plan_started_at timestamptz not null default now(),
  plan_expires_at timestamptz,
  updated_at timestamptz not null default now(),
  check (applications_used <= application_limit)
);

alter table public.v2_entitlements enable row level security;
revoke all on public.v2_entitlements from public, anon, authenticated;
grant select on public.v2_entitlements to authenticated;
drop policy if exists v2_entitlement_read_own on public.v2_entitlements;
create policy v2_entitlement_read_own on public.v2_entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.v2_assign_free_entitlement()
returns trigger language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  insert into public.v2_entitlements(user_id, plan_key, application_limit)
  values (new.id, 'free', 5)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists v2_auth_user_free_entitlement on auth.users;
create trigger v2_auth_user_free_entitlement
  after insert on auth.users
  for each row execute function public.v2_assign_free_entitlement();

insert into public.v2_entitlements(user_id, plan_key, application_limit)
select id, 'free', 5 from auth.users
on conflict (user_id) do nothing;

create table if not exists public.v2_employer_contacts (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  normalized_company_name text not null,
  company_domain text,
  recipient_email text not null,
  recipient_type text not null default 'recruitment',
  verification_status text not null check (verification_status in ('verified','approved','unverified','rejected')),
  source text not null default 'notion',
  source_record_id text unique,
  last_verified_at timestamptz,
  active boolean not null default true,
  do_not_send boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recipient_email = lower(trim(recipient_email)))
);
create index if not exists v2_employer_contacts_match
  on public.v2_employer_contacts(normalized_company_name)
  where active and not do_not_send;
alter table public.v2_employer_contacts enable row level security;
revoke all on public.v2_employer_contacts from public, anon, authenticated;

alter table public.v2_applications add column if not exists "recipientContactId" uuid references public.v2_employer_contacts(id);
alter table public.v2_applications add column if not exists "creditReservedAt" timestamptz;
alter table public.v2_applications add column if not exists "creditReleasedAt" timestamptz;
-- Older V2 application rows must not disclose employer addresses through customer RLS.
update public.v2_applications set "recipientEmail" = null where "recipientEmail" is not null;

create or replace function public.v2_reserve_application_credit(p_application_id uuid)
returns table(plan_key text, application_limit integer, applications_used integer)
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_app public.v2_applications%rowtype;
  v_plan public.v2_entitlements%rowtype;
begin
  if v_user_id is null then raise exception 'sign-in-required' using errcode = '42501'; end if;
  select * into v_app from public.v2_applications
    where id = p_application_id and user_id = v_user_id for update;
  if not found then raise exception 'application-not-found' using errcode = 'P0002'; end if;
  if v_app."creditReservedAt" is not null or v_app."providerMessageId" is not null or v_app.status = 'applied' then
    raise exception 'duplicate-application' using errcode = '23505';
  end if;
  insert into public.v2_entitlements(user_id) values (v_user_id) on conflict (user_id) do nothing;
  select * into v_plan from public.v2_entitlements where user_id = v_user_id for update;
  if v_plan.plan_expires_at is not null and v_plan.plan_expires_at <= now() then
    raise exception 'plan-expired' using errcode = 'P0001';
  end if;
  if v_plan.applications_used >= v_plan.application_limit then
    raise exception 'quota-exhausted' using errcode = 'P0001';
  end if;
  update public.v2_entitlements
    set applications_used = applications_used + 1, updated_at = now()
    where user_id = v_user_id returning * into v_plan;
  update public.v2_applications set "creditReservedAt" = now(), "creditReleasedAt" = null
    where id = p_application_id;
  return query select v_plan.plan_key, v_plan.application_limit, v_plan.applications_used;
end;
$$;

create or replace function public.v2_release_application_credit(p_application_id uuid)
returns boolean language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_app public.v2_applications%rowtype;
begin
  if v_user_id is null then raise exception 'sign-in-required' using errcode = '42501'; end if;
  select * into v_app from public.v2_applications
    where id = p_application_id and user_id = v_user_id for update;
  if not found then raise exception 'application-not-found' using errcode = 'P0002'; end if;
  if v_app."creditReservedAt" is null or v_app."creditReleasedAt" is not null then return false; end if;
  if v_app."providerMessageId" is not null or v_app."deliveryStatus" <> 'blocked' then
    raise exception 'credit-release-not-allowed' using errcode = '42501';
  end if;
  update public.v2_entitlements
    set applications_used = greatest(0, applications_used - 1), updated_at = now()
    where user_id = v_user_id;
  update public.v2_applications set "creditReleasedAt" = now() where id = p_application_id;
  return true;
end;
$$;

revoke all on function public.v2_reserve_application_credit(uuid) from public, anon;
revoke all on function public.v2_release_application_credit(uuid) from public, anon;
grant execute on function public.v2_reserve_application_credit(uuid) to authenticated;
grant execute on function public.v2_release_application_credit(uuid) to authenticated;
