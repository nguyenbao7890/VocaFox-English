-- VocaFox Supabase schema
-- Chạy file này trong Supabase SQL Editor trước khi deploy.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default 'Học viên VocaFox',
  role text not null default 'student' check (role in ('student','teacher','admin')),
  is_pro boolean not null default false,
  completed_units int[] not null default '{}',
  study_streak int not null default 0,
  usage_time_seconds int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.units (
  id int primary key,
  title text not null,
  content jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_attempts (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id text,
  score numeric,
  attempt jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists public.activity_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.increment_usage_seconds(p_user_id uuid, p_seconds int)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set usage_time_seconds = coalesce(usage_time_seconds, 0) + greatest(1, least(300, p_seconds)),
      updated_at = now()
  where id = p_user_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.activity_events enable row level security;

-- Frontend chỉ dùng Supabase Auth; dữ liệu app đi qua Express API bằng service role.
-- Vì vậy RLS không mở quyền ghi trực tiếp từ trình duyệt.
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "attempts_read_own" on public.exam_attempts;
create policy "attempts_read_own" on public.exam_attempts for select using (auth.uid() = user_id);
drop policy if exists "units_public_read" on public.units;
create policy "units_public_read" on public.units for select using (true);

-- Classroom collaboration: internal chat and online learning/test assignments
create table if not exists public.class_messages (
  id bigserial primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message_text text not null default '',
  emoji text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.class_assignments (
  id bigserial primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  type text not null default 'lesson' check (type in ('lesson','exam','live')),
  title text not null,
  description text not null default '',
  target text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_class_messages_class_created on public.class_messages(class_id, created_at);
create index if not exists idx_class_assignments_class_created on public.class_assignments(class_id, created_at desc);

alter table public.class_messages enable row level security;
alter table public.class_assignments enable row level security;

-- Dữ liệu lớp vẫn đi qua Express API bằng service role để kiểm soát quyền teacher/student thống nhất.

-- Exam bank managed by Admin. Existing local mock exams are still used as fallback when this table is empty.
create table if not exists public.exams (
  id text primary key,
  title text not null,
  content jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exams enable row level security;
drop policy if exists "exams_public_read" on public.exams;
create policy "exams_public_read" on public.exams for select using (true);

alter table public.class_assignments add column if not exists available_from timestamptz;
alter table public.class_assignments add column if not exists due_at timestamptz;
alter table public.class_assignments add column if not exists time_limit_minutes int;
alter table public.class_assignments add column if not exists payload jsonb not null default '{}';

-- Teacher Workspace V2
alter table public.classes add column if not exists meeting_url text not null default '';

create table if not exists public.teacher_materials (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null default 'PDF' check (type in ('PDF','Word','Slide','Video','Link web')),
  grade text not null default 'Lớp 9',
  description text not null default '',
  file_url text not null default '',
  web_url text not null default '',
  youtube_url text not null default '',
  slide_pdf_url text not null default '',
  cover_image_url text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  duration_minutes int not null default 45,
  question_count int not null default 0,
  source_pdf_url text not null default '',
  status text not null default 'ready',
  content jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  source_type text not null default 'AI',
  source text not null default '',
  question_count int not null default 0,
  content jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.online_tests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  exam_id uuid references public.teacher_exams(id) on delete set null,
  title text not null,
  open_at timestamptz not null,
  close_at timestamptz not null,
  duration_minutes int not null default 45,
  shuffle_questions boolean not null default true,
  show_score_after_submit boolean not null default true,
  one_attempt_only boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.online_tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  answers jsonb not null default '{}',
  score numeric,
  correct_count int not null default 0,
  total_questions int not null default 0,
  detail jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(test_id, student_id)
);

create index if not exists idx_teacher_materials_teacher on public.teacher_materials(teacher_id, created_at desc);
create index if not exists idx_teacher_exams_teacher on public.teacher_exams(teacher_id, created_at desc);
create index if not exists idx_teacher_quizzes_teacher on public.teacher_quizzes(teacher_id, created_at desc);
create index if not exists idx_online_tests_teacher on public.online_tests(teacher_id, created_at desc);
create index if not exists idx_online_tests_class on public.online_tests(class_id, open_at, close_at);
create index if not exists idx_test_attempts_test_student on public.test_attempts(test_id, student_id);

alter table public.teacher_materials enable row level security;
alter table public.teacher_exams enable row level security;
alter table public.teacher_quizzes enable row level security;
alter table public.online_tests enable row level security;
alter table public.test_attempts enable row level security;
