-- Run this in Supabase → SQL Editor → New query, then Run.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task text not null default '',
  owner text not null default '',
  deadline text not null default '',
  status text not null default 'pending'
);

alter table public.tasks enable row level security;

-- Open policies for development (anon + authenticated). Tighten for production.
drop policy if exists "tasks_select_all" on public.tasks;
drop policy if exists "tasks_insert_all" on public.tasks;
drop policy if exists "tasks_update_all" on public.tasks;

create policy "tasks_select_all" on public.tasks for select using (true);
create policy "tasks_insert_all" on public.tasks for insert with check (true);
create policy "tasks_update_all" on public.tasks for update using (true) with check (true);
