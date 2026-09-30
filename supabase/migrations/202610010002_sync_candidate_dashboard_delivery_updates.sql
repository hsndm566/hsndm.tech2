-- Propagate future delivery/response state changes into a claimed candidate dashboard.
create or replace function autoapply_private.sync_claimed_application_seed()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'autoapply_private'
as $function$
declare
  v_uid uuid;
  v_updated integer := 0;
begin
  select claimed_by into v_uid
  from autoapply_private.candidate_access_invites
  where id = new.invite_id;

  if v_uid is null then
    return new;
  end if;

  if new.provider_message_id is not null then
    update public.v2_applications
    set "companyName" = new.company_name,
        "roleTitle" = new.role_title,
        city = new.city,
        "appliedAt" = new.applied_at,
        "updatedAt" = now(),
        "recipientEmail" = new.recipient_email,
        "deliveryStatus" = new.delivery_status,
        "responseStatus" = new.response_status,
        "responseNote" = new.response_note,
        "responseUrl" = new.response_url,
        source = new.source,
        "sourceUrl" = new.source_url,
        "providerMessageId" = new.provider_message_id,
        "cvStoragePath" = new.cv_storage_path,
        "jobId" = new.job_id
    where user_id = v_uid
      and "providerMessageId" = new.provider_message_id;
    get diagnostics v_updated = row_count;
  end if;

  if v_updated = 0 then
    update public.v2_applications
    set "companyName" = new.company_name,
        "roleTitle" = new.role_title,
        city = new.city,
        "appliedAt" = new.applied_at,
        "updatedAt" = now(),
        "deliveryStatus" = new.delivery_status,
        "responseStatus" = new.response_status,
        "responseNote" = new.response_note,
        "responseUrl" = new.response_url,
        source = new.source,
        "sourceUrl" = new.source_url,
        "providerMessageId" = coalesce(new.provider_message_id, "providerMessageId"),
        "cvStoragePath" = new.cv_storage_path,
        "jobId" = new.job_id
    where user_id = v_uid
      and lower(coalesce("recipientEmail",'')) = lower(new.recipient_email)
      and lower("companyName") = lower(new.company_name)
      and lower("roleTitle") = lower(new.role_title);
    get diagnostics v_updated = row_count;
  end if;

  if v_updated = 0 then
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
    );
  end if;

  return new;
end;
$function$;

revoke all on function autoapply_private.sync_claimed_application_seed()
from public, anon, authenticated;

drop trigger if exists sync_claimed_application_seed_after_insert
  on autoapply_private.candidate_application_seeds;
drop trigger if exists sync_claimed_application_seed_after_change
  on autoapply_private.candidate_application_seeds;

create trigger sync_claimed_application_seed_after_change
after insert or update of delivery_status, response_status, response_note, response_url, provider_message_id, source
on autoapply_private.candidate_application_seeds
for each row
execute function autoapply_private.sync_claimed_application_seed();
