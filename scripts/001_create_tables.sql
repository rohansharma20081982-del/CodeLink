-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create meetings table
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid not null references auth.users(id) on delete cascade,
  title text default 'Interview Session',
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  is_active boolean default true
);

alter table public.meetings enable row level security;

-- Host can do everything with their meetings
create policy "meetings_select" on public.meetings for select using (true);
create policy "meetings_insert" on public.meetings for insert with check (auth.uid() = host_id);
create policy "meetings_update" on public.meetings for update using (auth.uid() = host_id);
create policy "meetings_delete" on public.meetings for delete using (auth.uid() = host_id);

-- Create meeting participants table
create table if not exists public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  role text not null check (role in ('host', 'candidate')),
  joined_at timestamp with time zone default now(),
  left_at timestamp with time zone
);

alter table public.meeting_participants enable row level security;

create policy "participants_select" on public.meeting_participants for select using (true);
create policy "participants_insert" on public.meeting_participants for insert with check (true);
create policy "participants_update" on public.meeting_participants for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
