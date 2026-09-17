-- Final platform upgrade: multi-admin, settings, gallery, storage.
-- Run once in Supabase -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('super_admin','admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  bride_name text not null,
  groom_name text not null,
  wedding_date date,
  venue text,
  room text,
  dress_code text,
  rsvp_deadline date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_admins (
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

alter table public.invitations add column if not exists wedding_id uuid references public.weddings(id) on delete cascade;
alter table public.wedding_settings add column if not exists wedding_id uuid references public.weddings(id) on delete cascade;

alter table public.weddings add column if not exists dress_code text;
alter table public.weddings add column if not exists rsvp_deadline date;

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  caption text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Convert wedding_settings from a global key to a wedding-scoped key where possible.
alter table public.wedding_settings drop constraint if exists wedding_settings_setting_key_key;
create unique index if not exists wedding_settings_wedding_key_uidx
  on public.wedding_settings(wedding_id, setting_key);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers are idempotent.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at before update on public.weddings
for each row execute function public.set_updated_at();

-- Ensure the current wedding exists.
insert into public.weddings (slug, bride_name, groom_name, wedding_date, venue, room, dress_code, rsvp_deadline)
values (
  'raveena-roshana', 'Raveena', 'Roshana', '2026-10-21',
  'Courtyard by Marriott Colombo', 'Grand Sapphire Ballroom', 'Dress To Impress', '2026-10-01'
)
on conflict (slug) do update set
  bride_name = excluded.bride_name,
  groom_name = excluded.groom_name,
  wedding_date = coalesce(public.weddings.wedding_date, excluded.wedding_date),
  venue = coalesce(public.weddings.venue, excluded.venue),
  room = coalesce(public.weddings.room, excluded.room),
  dress_code = coalesce(public.weddings.dress_code, excluded.dress_code),
  rsvp_deadline = coalesce(public.weddings.rsvp_deadline, excluded.rsvp_deadline);

-- Backfill existing rows to the current wedding.
update public.invitations
set wedding_id = (select id from public.weddings where slug = 'raveena-roshana')
where wedding_id is null;

update public.wedding_settings
set wedding_id = (select id from public.weddings where slug = 'raveena-roshana')
where wedding_id is null;

-- Flexible settings used by the public invitation and admin editor.
insert into public.wedding_settings (wedding_id, setting_key, setting_value)
select id, 'programme', '[
  {"time":"6:45 PM","title":"Welcome & Ceremony Start"},
  {"time":"7:02 PM","title":"Poruwa Nakatha"},
  {"time":"7:30 PM","title":"Reception & Partying"}
]'::jsonb from public.weddings where slug='raveena-roshana'
on conflict (wedding_id, setting_key) do nothing;

insert into public.wedding_settings (wedding_id, setting_key, setting_value)
select id, 'story', '[
  "Some love stories begin with a perfect plan. Ours began simply—with two people who met, became friends, and slowly discovered something more beautiful than either of us had expected.",
  "Along the way, life brought us laughter, beautiful memories, and challenges that made our bond stronger. Through every chapter, we continued to find our way back to each other and discovered that the best part of life is having someone with whom to share it. What started as a simple beginning has now brought us to this beautiful moment—a promise, a new beginning, and a lifetime together.",
  "And so, we celebrate not only the love that brought us together, but every moment that shaped our journey and led us to where we are today."
]'::jsonb from public.weddings where slug='raveena-roshana'
on conflict (wedding_id, setting_key) do nothing;

insert into public.wedding_settings (wedding_id, setting_key, setting_value)
select id, 'contacts', '[
  {"name":"Roshana","display":"071-8935991","href":"tel:+94718935991"},
  {"name":"Raveena","display":"070-1739272","href":"tel:+94701739272"}
]'::jsonb from public.weddings where slug='raveena-roshana'
on conflict (wedding_id, setting_key) do nothing;

insert into public.wedding_settings (wedding_id, setting_key, setting_value)
select id, 'marketing', '{
  "heading":"Digital Wedding Experience by Imesh Peiris",
  "body":"Beautifully crafted wedding invitation websites designed to make your celebration memorable from the very first impression.",
  "services":"Personalised guest invitations • Interactive RSVP • Elegant galleries • Seamless digital sharing",
  "phone":"0767550215",
  "email":"t.i.tpeeriya@gmail.com"
}'::jsonb from public.weddings where slug='raveena-roshana'
on conflict (wedding_id, setting_key) do nothing;

-- Public bucket; writes are still performed only by our server secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media', 'wedding-media', true, 10485760,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[];

alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_admins enable row level security;
alter table public.gallery_images enable row level security;

-- No browser table policies are required. All privileged data access goes through Next.js server routes.
