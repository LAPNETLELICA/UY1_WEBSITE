-- Password recovery for department administrators is handled by a Faculty
-- super administrator. The request contains no password or secret data.
create table if not exists public.department_admin_password_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

create unique index if not exists department_admin_password_request_pending_idx
  on public.department_admin_password_requests (user_id)
  where status = 'pending';

alter table public.department_admin_password_requests enable row level security;
revoke all on public.department_admin_password_requests from anon, authenticated;
