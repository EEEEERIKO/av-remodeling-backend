create table if not exists public.contacts (
  id bigserial primary key,
  full_name text not null,
  phone text not null,
  email text not null,
  address text,
  areas text[] not null,
  timeline text not null,
  property_type text,
  budget text,
  description text,
  referral text,
  created_at timestamp with time zone default now()
);

alter table public.contacts enable row level security;

create policy if not exists "Allow public inserts" on public.contacts
  for insert to anon
  with check (true);

create policy if not exists "Allow public selects" on public.contacts
  for select to anon
  using (true);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
