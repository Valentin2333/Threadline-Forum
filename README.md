# Forum System

A full-featured community forum built with **React 19**, **Supabase**, and **Bootstrap 5**. Users can register, create posts, comment, upvote/downvote, manage their profile with avatar uploads, and more. Admins have a dedicated dashboard for managing users and content.

## Hosted Project

**Live demo:** _Not currently hosted online._

## Tech Stack

- **Frontend:** React 19, React Router 7, React Hook Form, React-Bootstrap, Font Awesome
- **Backend / BaaS:** Supabase (Auth, PostgreSQL, Storage, Edge Functions, Row-Level Security)
- **Build tool:** Vite 7
- **Language:** JavaScript (JSX)

---

## Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** (included with Node)
- A **Supabase** project (free tier works fine)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd forum-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

You can find both values in your Supabase dashboard under **Settings → API**.

### 4. Set up the database

Open the Supabase SQL Editor and run the contents of `backup.sql` to create all tables, functions, triggers, indexes, and RLS policies.

### 5. Set up storage

In your Supabase dashboard, create a **Storage bucket** called `avatars` (set it to public or configure appropriate policies for read access).

### 6. Deploy the Edge Function

The project includes a Supabase Edge Function for account deletion (`supabase/functions/delete-user/index.ts`). Deploy it with the Supabase CLI:

```bash
npx supabase functions deploy delete-user
```

Make sure the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables are configured in your Supabase project's Edge Function settings.

### 7. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other scripts

| Command | Description |
|---|---|
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Database Schema

The database consists of **5 tables**, connected through foreign keys with cascading deletes. All tables have Row-Level Security (RLS) enabled.

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  auth.users  │       │   profiles   │       │  user_roles  │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │◄──────│ id (PK, FK)  │──────►│ user_id(PK,FK│
│ email        │  1:1  │ username (UQ)│  1:1  │ role         │
│ ...          │       │ email (UQ)   │       └──────────────┘
└──────────────┘       │ first_name   │
                       │ last_name    │
                       │ phone        │
                       │ avatar_url   │
                       │ avatar_path  │
                       │ avatar_upd.. │
                       │ is_blocked   │
                       │ reputation   │
                       │ is_active    │
                       │ created_at   │
                       │ updated_at   │
                       └──────┬───────┘
                              │ 1
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼ N          ▼ N          ▼ N
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │  posts   │  │ comments │  │  votes   │
          │──────────│  │──────────│  │──────────│
          │ id (PK)  │  │ id (PK)  │  │ id (PK)  │
          │ author_id│  │ post_id  │──│ voter_id │
          │ title    │  │ author_id│  │target_type│
          │ content  │  │ content  │  │ target_id│
          │ score    │  │ score    │  │ value    │
          │ comment_ │  │created_at│  │created_at│
          │  count   │  │updated_at│  └──────────┘
          │created_at│  └──────────┘
          │updated_at│       ▲ N
          └────┬─────┘       │
               │ 1           │
               └─────────────┘
```

### Table: `profiles`

Automatically created via a database trigger (`handle_new_user`) when a new user signs up through Supabase Auth. Linked 1:1 to `auth.users`.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | `uuid` | — | **NO** | Primary key. References `auth.users(id)` ON DELETE CASCADE |
| `username` | `text` | — | **NO** | Unique, case-insensitive. 4–32 chars. Cannot be changed after initial set |
| `first_name` | `text` | — | **NO** | 4–32 characters |
| `last_name` | `text` | — | **NO** | 4–32 characters |
| `email` | `text` | — | YES | Unique (case-insensitive). Copied from auth on creation |
| `phone` | `text` | — | YES | Optional phone number |
| `avatar_url` | `text` | `null` | YES | Storage path to avatar file |
| `avatar_path` | `text` | `null` | YES | Internal storage path |
| `avatar_updated_at` | `timestamptz` | `null` | YES | Last avatar change timestamp |
| `is_blocked` | `boolean` | `false` | **NO** | Blocked users cannot create posts or comments |
| `reputation` | `integer` | `0` | **NO** | Accumulated score from votes on user's posts/comments |
| `is_active` | `boolean` | `true` | **NO** | Account active flag |
| `created_at` | `timestamptz` | `now()` | **NO** | Row creation timestamp |
| `updated_at` | `timestamptz` | `now()` | **NO** | Auto-updated via trigger |

**Constraints:** `username_length_check (4–32)`, `first_name_length (4–32)`, `last_name_length (4–32)`, `profiles_username_key (UNIQUE)`, `profiles_email_unique (UNIQUE, case-insensitive)`

**Triggers:** `trg_prevent_username_change` — blocks username changes after initial set. `trg_profiles_updated_at` — auto-sets `updated_at`.

---

### Table: `posts`

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | **NO** | Primary key |
| `author_id` | `uuid` | — | **NO** | FK → `profiles(id)` ON DELETE CASCADE |
| `title` | `text` | — | **NO** | 16–64 characters |
| `content` | `text` | — | **NO** | 32–8,192 characters |
| `score` | `integer` | `0` | **NO** | Net vote score (managed by triggers, not editable directly) |
| `comment_count` | `integer` | `0` | **NO** | Denormalized count (managed by triggers, not editable directly) |
| `created_at` | `timestamptz` | `now()` | **NO** | Row creation timestamp |
| `updated_at` | `timestamptz` | `now()` | **NO** | Auto-updated via trigger |

**Constraints:** `post_title_length (16–64)`, `post_content_length (32–8192)`

**Triggers:** `trg_posts_updated_at`, `trg_prevent_manual_score_change` — prevents direct changes to `score` and `comment_count` from client-side queries.

**Indexes:** `idx_posts_created_at (DESC)`, `idx_posts_score (DESC)`, `idx_posts_comment_count (DESC)`

---

### Table: `comments`

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | **NO** | Primary key |
| `post_id` | `uuid` | — | **NO** | FK → `posts(id)` ON DELETE CASCADE |
| `author_id` | `uuid` | — | **NO** | FK → `profiles(id)` ON DELETE CASCADE |
| `content` | `text` | — | **NO** | 1–8,192 characters |
| `score` | `integer` | `0` | **NO** | Net vote score |
| `created_at` | `timestamptz` | `now()` | **NO** | Row creation timestamp |
| `updated_at` | `timestamptz` | `now()` | **NO** | Auto-updated via trigger |

**Constraints:** `comment_content_length (1–8192)`

**Triggers:** `trg_comments_count_insert` / `trg_comments_count_delete` — syncs the parent post's `comment_count`. `trg_comments_updated_at` — auto-sets `updated_at`.

**Indexes:** `idx_comments_post_id`, `idx_comments_created_at (DESC)`

---

### Table: `votes`

Each user can cast one vote per target (post or comment). The `value` is either `+1` (upvote) or `-1` (downvote).

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | **NO** | Primary key |
| `voter_id` | `uuid` | — | **NO** | FK → `profiles(id)` ON DELETE CASCADE |
| `target_type` | `vote_target` (enum) | — | **NO** | `'post'` or `'comment'` |
| `target_id` | `uuid` | — | **NO** | ID of the post or comment being voted on |
| `value` | `integer` | — | **NO** | `1` (upvote) or `-1` (downvote) |
| `created_at` | `timestamptz` | `now()` | **NO** | Vote timestamp |

**Constraints:** `votes_value_check (value IN (-1, 1))`, `unique_vote (voter_id, target_type, target_id)`

**Triggers:** `votes_apply_score` — on INSERT/UPDATE/DELETE, automatically adjusts the `score` on the target post/comment and the author's `reputation` on their profile.

---

### Table: `user_roles`

Maps users to roles. Used by the `is_admin()` SQL function to gate admin-only operations in RLS policies.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `user_id` | `uuid` | — | **NO** | Primary key. FK → `profiles(id)` ON DELETE CASCADE |
| `role` | `text` | — | **NO** | `'user'` or `'admin'` |

**Constraints:** `user_roles_role_check (role IN ('user', 'admin'))`

---

### Custom Enum

| Name | Values |
|---|---|
| `vote_target` | `'post'`, `'comment'` |

### Key Database Functions

| Function | Purpose |
|---|---|
| `handle_new_user()` | Trigger function: creates a `profiles` row when a new `auth.users` record is inserted |
| `is_admin(uid)` | Returns `true` if the user has an `'admin'` role in `user_roles` |
| `apply_vote_effect(...)` | Adjusts score on the target and reputation on the author's profile |
| `apply_vote_to_score()` | Trigger function for the `votes` table — delegates to `apply_vote_effect` |
| `comments_count_sync()` | Trigger function: increments/decrements `posts.comment_count` on comment insert/delete |
| `prevent_manual_score_change()` | Trigger function: blocks direct client updates to `posts.score` and `posts.comment_count` |
| `prevent_username_change()` | Trigger function: blocks changes to `profiles.username` after initial assignment |
| `set_updated_at()` | Trigger function: sets `updated_at = now()` before every update |

### Row-Level Security (RLS) Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Public (all rows readable) | Own row only (authenticated) | Own row only | Own row or service role |
| `posts` | Public | Authenticated + not blocked | Own or admin | Own or admin |
| `comments` | Public | Authenticated + not blocked | Own or admin | Own or admin |
| `votes` | Public | Own votes only | Own votes only | Own votes only |
| `user_roles` | Admin only | Admin only | Admin only | Admin / service role |

### Supabase Storage

| Bucket | Purpose |
|---|---|
| `avatars` | Stores user profile pictures. Files are organized under `<user_id>/` folders. |

### Edge Function

| Function | Path | Purpose |
|---|---|---|
| `delete-user` | `supabase/functions/delete-user/index.ts` | Securely deletes a user account: removes avatar files from storage, deletes the profile row, and removes the auth user. Requires the caller's JWT for authorization and uses the service role key internally. |
