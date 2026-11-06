-- 拾光英语：CloudBase PostgreSQL 社交与聊天数据结构
-- 环境：ethan-services-d6ggnvhdo7e86df4d

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id varchar(64) primary key default auth.uid(),
  display_name varchar(40) not null,
  email varchar(254),
  avatar_url text,
  english_level varchar(8) not null default 'B1',
  bio varchar(160) not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email varchar(254);
create unique index if not exists profiles_email_lower_idx on public.profiles(lower(email)) where email is not null;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id varchar(64) not null default auth.uid(),
  content text not null check (char_length(content) between 1 and 2000),
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id varchar(64) not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id varchar(64) not null default auth.uid(),
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.post_reposts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id varchar(64) not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id varchar(64) not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id varchar(64) not null,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id varchar(64) not null default auth.uid(),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_created_idx on public.post_comments(post_id, created_at);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);

create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation
      and cm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

grant select on public.posts, public.post_likes,
  public.post_comments, public.post_reposts to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles, public.posts, public.post_likes,
  public.post_comments, public.post_reposts to authenticated;
grant select, insert, update, delete on public.conversations,
  public.conversation_members, public.messages to authenticated;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reposts enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy posts_read on public.posts for select to anon, authenticated using (true);
create policy posts_insert_own on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy posts_update_own on public.posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy posts_delete_own on public.posts for delete to authenticated using (author_id = auth.uid());

create policy likes_read on public.post_likes for select to anon, authenticated using (true);
create policy likes_insert_own on public.post_likes for insert to authenticated with check (user_id = auth.uid());
create policy likes_delete_own on public.post_likes for delete to authenticated using (user_id = auth.uid());

create policy comments_read on public.post_comments for select to anon, authenticated using (true);
create policy comments_insert_own on public.post_comments for insert to authenticated with check (author_id = auth.uid());
create policy comments_update_own on public.post_comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comments_delete_own on public.post_comments for delete to authenticated using (author_id = auth.uid());

create policy reposts_read on public.post_reposts for select to anon, authenticated using (true);
create policy reposts_insert_own on public.post_reposts for insert to authenticated with check (user_id = auth.uid());
create policy reposts_delete_own on public.post_reposts for delete to authenticated using (user_id = auth.uid());

create policy conversations_read_members on public.conversations
  for select to authenticated using (public.is_conversation_member(id) or owner_id = auth.uid());
create policy conversations_insert_own on public.conversations
  for insert to authenticated with check (owner_id = auth.uid());
create policy conversations_update_members on public.conversations
  for update to authenticated using (public.is_conversation_member(id) or owner_id = auth.uid());

create policy conversation_members_read on public.conversation_members
  for select to authenticated using (public.is_conversation_member(conversation_id) or user_id = auth.uid());
create policy conversation_members_insert on public.conversation_members
  for insert to authenticated with check (
    user_id = auth.uid() or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.owner_id = auth.uid()
    )
  );
create policy conversation_members_delete_own on public.conversation_members
  for delete to authenticated using (user_id = auth.uid());

create policy messages_read_members on public.messages
  for select to authenticated using (public.is_conversation_member(conversation_id));
create policy messages_insert_members on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and public.is_conversation_member(conversation_id)
  );
create policy messages_update_own on public.messages
  for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid());
create policy messages_delete_own on public.messages
  for delete to authenticated using (sender_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-images',
  'social-images',
  true,
  5 * 1024 * 1024,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

create policy social_images_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'social-images');

create policy social_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'social-images'
    and (storage.foldername(name))[1] = auth.uid()
  );

create policy social_images_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'social-images' and (storage.foldername(name))[1] = auth.uid())
  with check (bucket_id = 'social-images' and (storage.foldername(name))[1] = auth.uid());

create policy social_images_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'social-images' and (storage.foldername(name))[1] = auth.uid());

