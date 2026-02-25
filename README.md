# Threadline

A full-featured community forum platform built with React and Supabase. Users can create and join communities (prefixed with `f/`), publish posts, comment, upvote/downvote, manage profiles, and more — all within a responsive, theme-aware interface.

## Hosted Project

🔗 **Live demo:** [https://threadline.netlify.app](https://threadline.netlify.app)

## Features

- **Communities** — create, join, leave, and manage communities with the `f/` prefix
- **Posts & Comments** — full CRUD with inline editing, validation, and author attribution
- **Voting** — upvote/downvote system that updates post scores and author reputation in real time via database triggers
- **Global Search** — search across communities and posts from a single search bar
- **User Profiles** — avatar uploads to Supabase Storage, profile editing, account deletion
- **Admin Dashboard** — manage users (block/unblock), posts, and communities with platform statistics
- **Dark / Light Theme** — toggle switch in the navbar, persisted in localStorage, respects OS preference
- **Responsive Design** — desktop navigation bar + mobile offcanvas sidebar
- **Authentication** — email/password registration and login via Supabase Auth
- **Footer Pages** — FAQ, Terms & Conditions, Privacy Policy, and Contact Us form (via Formsubmit.co)

## Tech Stack

| Layer       | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Frontend    | React 19, Vite 7, React Router 7                               |
| UI          | Bootstrap 5, React Bootstrap, Font Awesome 7                   |
| Forms       | React Hook Form                                                 |
| Backend     | Supabase (Auth, PostgreSQL, Storage, Row-Level Security)        |
| Testing     | Vitest, Testing Library, happy-dom                              |

## Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project (free tier works) with the database schema applied (see [Database Schema](#database-schema))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/forum-system.git
cd forum-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are available in the Supabase dashboard under **Settings → API**.

### 4. Set up the database

Apply the schema from the [Database Schema](#database-schema) section below in the Supabase SQL Editor. This creates all tables, functions, triggers, indexes, and RLS policies.

### 5. Set up Supabase Storage

Create a **public** storage bucket named `avatars` in Supabase Storage for user profile pictures.

### 6. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command                 | Description                |
| ----------------------- | -------------------------- |
| `npm run dev`           | Start development server   |
| `npm run build`         | Production build           |
| `npm run preview`       | Preview production build   |
| `npm test`              | Run all tests once         |
| `npm run test:watch`    | Run tests in watch mode    |
| `npm run test:coverage` | Run tests with coverage    |
| `npm run lint`          | Lint the codebase          |

## Database Schema

The database runs on **Supabase PostgreSQL** with Row-Level Security (RLS) enabled on every table.

### Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│       profiles       │       │   communities    │       │    user_roles    │
├──────────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id          (PK, FK) │◄──┐   │ id          (PK) │       │ user_id (PK, FK) │
│ username        (UQ) │   │   │ name        (UQ) │       │ role             │
│ email                │   │   │ description      │       └────────┬─────────┘
│ first_name           │   │   │ creator_id  (FK) │───┐            │
│ last_name            │   │   │ member_count     │   │   references profiles
│ phone                │   │   │ created_at       │   │
│ avatar_url           │   │   └────────┬─────────┘   │
│ avatar_path          │   │            │             │
│ avatar_updated_at    │   │   ┌────────┴─────────┐   │
│ is_blocked           │   │   │community_members │   │
│ is_admin             │   │   ├──────────────────┤   │
│ reputation           │   │   │ id          (PK) │   │
│ is_active            │   │   │ community_id(FK) │───┘
│ created_at           │   │   │ user_id     (FK) │── references profiles
│ updated_at           │   │   │ joined_at        │
└──────────────────────┘   │   └──────────────────┘
         │                 │
         │                 │
    ┌────┴─────────────┐   │   ┌──────────────────┐
    │      posts       │   │   │      votes       │
    ├──────────────────┤   │   ├──────────────────┤
    │ id          (PK) │   │   │ id          (PK) │
    │ author_id   (FK) │───┘   │ voter_id    (FK) │── references profiles
    │ community_id(FK) │       │ target_type      │   (enum: 'post'|'comment')
    │ title            │       │ target_id        │
    │ content          │       │ value            │   (-1 or 1)
    │ score            │       │ created_at       │
    │ comment_count    │       └──────────────────┘
    │ created_at       │         UNIQUE(voter_id, target_type, target_id)
    │ updated_at       │
    └────────┬─────────┘
             │
    ┌────────┴─────────┐
    │     comments     │
    ├──────────────────┤
    │ id          (PK) │
    │ post_id     (FK) │── references posts    (CASCADE)
    │ author_id   (FK) │── references profiles (CASCADE)
    │ content          │
    │ score            │
    │ created_at       │
    │ updated_at       │
    └──────────────────┘
```

### Tables

#### `profiles`

Stores user profile data. A row is automatically created on registration via the `handle_new_user()` trigger on `auth.users`.

| Column              | Type          | Constraints / Default                      |
| ------------------- | ------------- | ------------------------------------------ |
| `id`                | `uuid`        | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `username`          | `text`        | UNIQUE (case-insensitive), NOT NULL, 4–32 chars |
| `email`             | `text`        | UNIQUE (case-insensitive)                  |
| `first_name`        | `text`        | NOT NULL, 4–32 chars                       |
| `last_name`         | `text`        | NOT NULL, 4–32 chars                       |
| `phone`             | `text`        | nullable                                   |
| `avatar_url`        | `text`        | nullable                                   |
| `avatar_path`       | `text`        | nullable (Supabase Storage path)           |
| `avatar_updated_at` | `timestamptz` | nullable                                   |
| `is_blocked`        | `boolean`     | NOT NULL, default `false`                  |
| `is_admin`          | `boolean`     | NOT NULL, default `false`                  |
| `reputation`        | `integer`     | NOT NULL, default `0`                      |
| `is_active`         | `boolean`     | NOT NULL, default `true`                   |
| `created_at`        | `timestamptz` | NOT NULL, default `now()`                  |
| `updated_at`        | `timestamptz` | NOT NULL, default `now()`                  |

#### `communities`

Each community name is prefixed with `f/` (e.g. `f/react-devs`).

| Column         | Type          | Constraints / Default                       |
| -------------- | ------------- | ------------------------------------------- |
| `id`           | `uuid`        | PK, default `gen_random_uuid()`             |
| `name`         | `text`        | UNIQUE, NOT NULL                            |
| `description`  | `text`        | nullable                                    |
| `creator_id`   | `uuid`        | FK → `profiles(id)` ON DELETE CASCADE       |
| `member_count` | `integer`     | NOT NULL, default `0`                       |
| `created_at`   | `timestamptz` | NOT NULL, default `now()`                   |

#### `community_members`

Join table linking users to communities they have joined.

| Column         | Type          | Constraints / Default                       |
| -------------- | ------------- | ------------------------------------------- |
| `id`           | `uuid`        | PK, default `gen_random_uuid()`             |
| `community_id` | `uuid`       | FK → `communities(id)` ON DELETE CASCADE    |
| `user_id`      | `uuid`        | FK → `profiles(id)` ON DELETE CASCADE       |
| `joined_at`    | `timestamptz` | NOT NULL, default `now()`                   |

#### `posts`

| Column          | Type          | Constraints / Default                       |
| --------------- | ------------- | ------------------------------------------- |
| `id`            | `uuid`        | PK, default `gen_random_uuid()`             |
| `author_id`     | `uuid`        | FK → `profiles(id)` ON DELETE CASCADE       |
| `community_id`  | `uuid`        | FK → `communities(id)`, nullable            |
| `title`         | `text`        | NOT NULL, 16–64 chars                       |
| `content`       | `text`        | NOT NULL, 32–8 192 chars                    |
| `score`         | `integer`     | NOT NULL, default `0` (managed by triggers) |
| `comment_count` | `integer`     | NOT NULL, default `0` (managed by triggers) |
| `created_at`    | `timestamptz` | NOT NULL, default `now()`                   |
| `updated_at`    | `timestamptz` | NOT NULL, default `now()`                   |

#### `comments`

| Column       | Type          | Constraints / Default                       |
| ------------ | ------------- | ------------------------------------------- |
| `id`         | `uuid`        | PK, default `gen_random_uuid()`             |
| `post_id`    | `uuid`        | FK → `posts(id)` ON DELETE CASCADE          |
| `author_id`  | `uuid`        | FK → `profiles(id)` ON DELETE CASCADE       |
| `content`    | `text`        | NOT NULL, 1–8 192 chars                     |
| `score`      | `integer`     | NOT NULL, default `0`                       |
| `created_at` | `timestamptz` | NOT NULL, default `now()`                   |
| `updated_at` | `timestamptz` | NOT NULL, default `now()`                   |

#### `votes`

Polymorphic voting — a single table handles votes on both posts and comments.

| Column        | Type                      | Constraints / Default                          |
| ------------- | ------------------------- | ---------------------------------------------- |
| `id`          | `uuid`                    | PK, default `gen_random_uuid()`                |
| `voter_id`    | `uuid`                    | FK → `profiles(id)` ON DELETE CASCADE          |
| `target_type` | `enum('post','comment')`  | NOT NULL                                       |
| `target_id`   | `uuid`                    | NOT NULL                                       |
| `value`       | `integer`                 | NOT NULL, CHECK (`-1` or `1`)                  |
| `created_at`  | `timestamptz`             | NOT NULL, default `now()`                      |
|               |                           | UNIQUE(`voter_id`, `target_type`, `target_id`) |

#### `user_roles`

Tracks admin privileges. Checked by the `is_admin()` SQL function used in RLS policies.

| Column    | Type   | Constraints / Default                       |
| --------- | ------ | ------------------------------------------- |
| `user_id` | `uuid` | PK, FK → `profiles(id)` ON DELETE CASCADE   |
| `role`    | `text` | NOT NULL, CHECK (`'user'` or `'admin'`)     |

### Database Functions & Triggers

| Function                             | Trigger fires on             | Purpose                                                            |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------ |
| `handle_new_user()`                  | `auth.users` INSERT          | Auto-creates a `profiles` row for every new sign-up               |
| `apply_vote_to_score()`             | `votes` INSERT/UPDATE/DELETE | Keeps `posts.score` in sync with vote totals                      |
| `update_author_reputation()`        | `votes` INSERT/UPDATE/DELETE | Recalculates `profiles.reputation` from all the author's votes    |
| `update_reputation_on_post_delete()`| `posts` DELETE               | Recalculates author reputation when a post is removed             |
| `comments_count_sync()`             | `comments` INSERT/DELETE     | Keeps `posts.comment_count` in sync                               |
| `prevent_manual_score_change()`     | `posts` UPDATE               | Blocks direct client-side edits to `score` and `comment_count`    |
| `prevent_username_change()`         | `profiles` UPDATE            | Makes `username` immutable after initial creation                 |
| `set_updated_at()`                  | `profiles`/`posts`/`comments` UPDATE | Auto-sets `updated_at` to `now()`                        |
| `is_admin(uid)`                     | — (SQL function)             | Returns `true` if the user has an admin role; used in RLS policies |

### Row-Level Security (RLS)

All tables have RLS enabled. Summary of key policies:

| Table               | SELECT        | INSERT                          | UPDATE              | DELETE              |
| ------------------- | ------------- | ------------------------------- | ------------------- | ------------------- |
| `profiles`          | public        | auto via trigger                | own or admin        | own                 |
| `communities`       | public        | authenticated                   | creator             | creator             |
| `community_members` | public        | authenticated (self)            | —                   | own membership      |
| `posts`             | public        | authenticated + not blocked     | own or admin        | own or admin        |
| `comments`          | public        | authenticated + not blocked     | own or admin        | own or admin        |
| `votes`             | public        | authenticated (own `voter_id`)  | own                 | own                 |
| `user_roles`        | admin only    | admin only                      | admin only          | admin only          |

## Project Structure

```
src/
├── api/                          # Supabase API layer
│   ├── supabaseClient.js         # Supabase client initialisation
│   ├── posts.js                  # Post CRUD + queries
│   ├── comments.js               # Comment CRUD
│   ├── votes.js                  # Vote upsert / delete / get
│   ├── communities.js            # Community CRUD, membership, search
│   └── admin.js                  # Admin user / post / community management
│
├── components/
│   ├── admin/                    # Admin dashboard, stats, user & post management
│   ├── auth/                     # Login, Register, shared auth components
│   ├── communities/              # Community list, page, members, global search
│   ├── footer/                   # Footer, FAQ, Terms, Privacy, Contact Us
│   ├── home/                     # Landing page, stat cards, feature list
│   ├── navigation/               # Navbar, desktop nav, mobile sidebar, avatar
│   ├── posting/                  # Posts, comments, votes, filters, search
│   ├── shared/                   # Reusable modals and components
│   ├── theme/                    # Dark / light theme context and toggle
│   └── userProfile/              # Profile view / edit, avatar upload, delete account
│
├── App.jsx                       # Root routing + layout
├── main.jsx                      # Entry point with providers
└── index.css                     # Global theme, dark mode, component styles
```
