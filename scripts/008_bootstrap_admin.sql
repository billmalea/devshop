-- Bootstrap Admin Script
-- Purpose: Promote the earliest existing user in auth.users to superadmin IF no admin exists yet.
-- Usage: Run once manually in Supabase SQL editor OR call the function with a service role key.
-- Safety: This will ONLY insert if public.admin_users is empty.
-- NOTE: Do NOT leave automated invocation in production; run intentionally.

-- Function (idempotent):
create or replace function public.bootstrap_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only act if there is currently no admin row.
  if not exists (select 1 from public.admin_users) then
    insert into public.admin_users (id, role, is_active, permissions)
    select u.id, 'superadmin', true, '[]'::jsonb
    from auth.users u
    order by u.created_at asc
    limit 1
    on conflict (id) do update set role='superadmin', is_active=true;
  end if;
end;
$$;

-- One-off direct execution (uncomment to run inline):
-- select public.bootstrap_admin();

-- Alternatively, manual insert specifying a UUID (replace YOUR_USER_UUID):
-- insert into public.admin_users (id, role, is_active) values ('YOUR_USER_UUID', 'superadmin', true)
-- on conflict (id) do update set role='superadmin', is_active=true;

-- Verification query:
-- select * from public.admin_users;
