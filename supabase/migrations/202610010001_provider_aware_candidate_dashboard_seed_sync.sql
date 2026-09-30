-- Keep candidate dashboard imports provider-aware and live after access is claimed.
-- Applied to Supabase project ufyvelnxexjvlibhweau as migration provider_aware_candidate_dashboard_seed_sync.

alter table autoapply_private.candidate_application_seeds
  add column if not exists source text,
  add column if not exists provider_message_id text,
  add column if not exists source_url text,
  add column if not exists job_id text,
  add column if not exists cv_storage_path text;

update autoapply_private.candidate_application_seeds
set source = 'brevo_campaign'
where source is null;

alter table autoapply_private.candidate_application_seeds
  alter column source set default 'autoapply_campaign',
  alter column source set not null;

create unique index if not exists candidate_application_seeds_provider_message_id_key
  on autoapply_private.candidate_application_seeds(provider_message_id)
  where provider_message_id is not null;

create or replace function public.claim_candidate_access(p_code text)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'auth', 'autoapply_private'
as $function$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_invite autoapply_private.candidate_access_invites%rowtype;
  v_count integer;
begin
  if v_uid is null or v_email = '' then
    raise exception 'authentication required';
  end if;

  select * into v_invite
  from autoapply_private.candidate_access_invites
  where code_hash = encode(digest(trim(p_code), 'sha256'), 'hex')
    and lower(email) = v_email
    and (claimed_by is null or claimed_by = v_uid)
  for update;

  if not found then
    raise exception 'invalid access code for this account';
  end if;

  update autoapply_private.candidate_access_invites
  set claimed_by = v_uid,
      claimed_at = coalesce(claimed_at, now())
  where id = v_invite.id;

  insert into public.v2_profiles(
    user_id, "fullName", "targetCity", "targetIndustry",
    "preferredLanguage", "openToRemote", "resumeFileName"
  )
  values(
    v_uid, v_invite.full_name, v_invite.target_city, v_invite.target_industry,
    'English', false, v_invite.resume_file_name
  )
  on conflict(user_id) do update set
    "fullName" = excluded."fullName",
    "targetCity" = excluded."targetCity",
    "targetIndustry" = excluded."targetIndustry",
    "resumeFileName" = coalesce(public.v2_profiles."resumeFileName", excluded."resumeFileName");

  insert into public.v2_applications(
    user_id, "companyName", "roleTitle", city, status,
    "appliedAt", "updatedAt", "createdAt",
    "recipientEmail", "deliveryStatus", "responseStatus",
    "responseNote", "responseUrl", source, "sourceUrl",
    "providerMessageId", "cvStoragePath", "jobId"
  )
  select
    v_uid, s.company_name, s.role_title, s.city, 'applied',
    s.applied_at, now(), s.applied_at,
    s.recipient_email, s.delivery_status, s.response_status,
    s.response_note, s.response_url, s.source, s.source_url,
    s.provider_message_id, s.cv_storage_path, s.job_id
  from autoapply_private.candidate_application_seeds s
  where s.invite_id = v_invite.id
    and not exists (
      select 1
      from public.v2_applications a
      where a.user_id = v_uid
        and (
          (s.provider_message_id is not null and a."providerMessageId" = s.provider_message_id)
          or (
            lower(coalesce(a."recipientEmail",'')) = lower(s.recipient_email)
            and lower(a."companyName") = lower(s.company_name)
            and lower(a."roleTitle") = lower(s.role_title)
          )
        )
    )
  on conflict do nothing;

  select count(*) into v_count
  from public.v2_applications
  where user_id = v_uid;

  return jsonb_build_object('ok', true, 'applications', v_count, 'name', v_invite.full_name);
end;
$function$;

create or replace function autoapply_private.sync_claimed_application_seed()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'autoapply_private'
as $function$
declare
  v_uid uuid;
begin
  select claimed_by into v_uid
  from autoapply_private.candidate_access_invites
  where id = new.invite_id;

  if v_uid is null then
    return new;
  end if;

  insert into public.v2_applications(
    user_id, "companyName", "roleTitle", city, status,
    "appliedAt", "updatedAt", "createdAt",
    "recipientEmail", "deliveryStatus", "responseStatus",
    "responseNote", "responseUrl", source, "sourceUrl",
    "providerMessageId", "cvStoragePath", "jobId"
  )
  values(
    v_uid, new.company_name, new.role_title, new.city, 'applied',
    new.applied_at, now(), new.applied_at,
    new.recipient_email, new.delivery_status, new.response_status,
    new.response_note, new.response_url, new.source, new.source_url,
    new.provider_message_id, new.cv_storage_path, new.job_id
  )
  on conflict do nothing;

  return new;
end;
$function$;

revoke all on function autoapply_private.sync_claimed_application_seed() from public, anon, authenticated;

drop trigger if exists sync_claimed_application_seed_after_insert
  on autoapply_private.candidate_application_seeds;

create trigger sync_claimed_application_seed_after_insert
after insert on autoapply_private.candidate_application_seeds
for each row
execute function autoapply_private.sync_claimed_application_seed();
