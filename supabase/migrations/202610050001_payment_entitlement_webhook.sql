create table if not exists public.v2_payment_events (
  payment_id text primary key,
  customer_email text not null,
  plan_key text not null check (plan_key in ('starter','pro','founder')),
  application_limit integer not null check (application_limit > 0),
  received_at timestamptz not null default now()
);

alter table public.v2_payment_events enable row level security;
revoke all on public.v2_payment_events from public, anon, authenticated;

create or replace function public.v2_apply_payment_entitlement(
  p_payment_id text,
  p_customer_email text,
  p_plan_key text,
  p_application_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
  v_inserted integer;
begin
  if p_payment_id is null or length(trim(p_payment_id)) < 3 then
    raise exception 'payment-id-required' using errcode = '22023';
  end if;
  if lower(trim(p_plan_key)) not in ('starter','pro','founder') then
    raise exception 'invalid-plan' using errcode = '22023';
  end if;
  if p_application_limit <= 0 then
    raise exception 'invalid-application-limit' using errcode = '22023';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_customer_email))
  limit 1;

  if v_user_id is null then
    raise exception 'customer-not-found' using errcode = 'P0002';
  end if;

  insert into public.v2_payment_events(payment_id, customer_email, plan_key, application_limit)
  values (trim(p_payment_id), lower(trim(p_customer_email)), lower(trim(p_plan_key)), p_application_limit)
  on conflict (payment_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.v2_entitlements(user_id, plan_key, application_limit, applications_used, plan_started_at, plan_expires_at, updated_at)
  values (v_user_id, lower(trim(p_plan_key)), p_application_limit, 0, now(), now() + interval '30 days', now())
  on conflict (user_id) do update
    set plan_key = excluded.plan_key,
        application_limit = excluded.application_limit,
        applications_used = 0,
        plan_started_at = excluded.plan_started_at,
        plan_expires_at = excluded.plan_expires_at,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.v2_apply_payment_entitlement(text,text,text,integer) from public, anon, authenticated;
grant execute on function public.v2_apply_payment_entitlement(text,text,text,integer) to service_role;
