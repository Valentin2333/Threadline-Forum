# Threadline

A full-featured community forum built with React and Supabase. Users can create and join communities (prefixed with `t/`), publish posts, comment, vote, upload avatars, and receive real-time notifications. Admins have access to a dashboard for managing users, posts, communities, and content reports.

## Live Demo

🔗 **Hosted at:** https://threadl.netlify.app/

---

## Features

- **Communities** — Create public communities (`t/name`), join/leave, manage members (creator and admin moderation)
- **Posts & Comments** — Publish posts within communities, comment on posts, inline editing and deletion
- **Voting** — Upvote/downvote posts and comments; scores update author reputation
- **Real-time Notifications** — Instant alerts for upvotes, downvotes, and comments on your posts
- **Content Reporting** — Report posts/comments for harassment, violence, or hate speech
- **Admin Dashboard** — Manage users (block/unblock), posts, communities, and review reports with real-time badge counts
- **User Profiles** — Editable profiles with avatar upload, reputation display, and recent post history
- **Global Search** — Search across communities and posts from a single search bar
- **Dark/Light Theme** — Toggle between themes, persisted across sessions
- **Responsive Design** — Desktop navbar and mobile sidebar with full feature parity

---

## Tech Stack

- **Frontend:** React 19, React Router 7, React Bootstrap, Font Awesome
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions, Row Level Security)
- **Build:** Vite 7, SWC
- **Testing:** Vitest, React Testing Library, happy-dom

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd forum-system
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are available in your Supabase project dashboard under **Settings → API**.

### 3. Set up the database

Run the SQL from `backup.sql` in your Supabase SQL Editor to create all tables, constraints, indexes, RLS policies, and triggers. Then run any files in `supabase/migrations/` for additional tables (e.g. `reports`).

Ensure **Realtime** is enabled for the `posts`, `comments`, `notifications`, `votes`, and `reports` tables in the Supabase dashboard under **Database → Replication**.

### 4. Set up Storage

Create an `avatars` bucket in Supabase Storage (Settings → Storage) with public access enabled.

### 5. Deploy the Edge Function

The project includes a `delete-user` Edge Function in `supabase/functions/delete-user/`. Deploy it with:

```bash
npx supabase functions deploy delete-user
```

### 6. Run the app

```bash
npm run dev
```

The app starts at `http://localhost:5173`.

### 7. Run tests

```bash
npm test
```

---

## Database Schema

The database consists of **10 tables** and **1 custom enum type**. All primary keys are UUIDs. Foreign keys cascade on delete.

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│  auth.users  │       │     profiles     │       │  user_roles  │
│──────────────│1─────1│──────────────────│1─────1│──────────────│
│ id (PK)      │       │ id (PK, FK)      │       │ user_id (PK) │
│ email        │       │ username (unique)│       │ role         │
│ ...          │       │ first_name       │       └──────────────┘
└──────────────┘       │ last_name        │
                       │ email            │
                       │ phone            │
                       │ avatar_url       │
                       │ avatar_path      │
                       │ avatar_updated_at│
                       │ is_admin         │
                       │ is_blocked       │
                       │ is_active        │
                       │ reputation       │
                       │ created_at       │
                       │ updated_at       │
                       └──────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   communities    │ │    posts     │ │      votes       │
│──────────────────│ │──────────────│ │──────────────────│
│ id (PK)          │ │ id (PK)      │ │ id (PK)          │
│ name (unique)    │ │ author_id(FK)│ │ voter_id (FK)    │
│ description      │ │ community_id │ │ target_type      │
│ creator_id (FK)  │ │ title        │ │ target_id        │
│ member_count     │ │ content      │ │ value (+1 / -1)  │
│ created_at       │ │ score        │ │ created_at       │
│ updated_at       │ │ comment_count│ └──────────────────┘
└────────┬─────────┘ │ created_at   │
         │           │ updated_at   │
         │           └──────┬───────┘
         │                  │
         ▼                  ▼
┌──────────────────┐ ┌──────────────────┐
│community_members │ │    comments      │
│──────────────────│ │──────────────────│
│ id (PK)          │ │ id (PK)          │
│ community_id(FK) │ │ post_id (FK)     │
│ user_id (FK)     │ │ author_id (FK)   │
│ joined_at        │ │ content          │
└──────────────────┘ │ score            │
                     │ created_at       │
                     │ updated_at       │
                     └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│  notifications   │       │     reports      │
│──────────────────│       │──────────────────│
│ id (PK)          │       │ id (PK)          │
│ recipient_id(FK) │       │ reporter_id (FK) │
│ actor_id (FK)    │       │ post_id (FK)?    │
│ post_id (FK)     │       │ comment_id (FK)? │
│ comment_id (FK)  │       │ reason           │
│ type             │       │ is_reviewed      │
│ is_read          │       │ created_at       │
│ created_at       │       └──────────────────┘
└──────────────────┘
```

### Table Details

#### `profiles`

Extends Supabase Auth. One row per registered user, linked by `id` → `auth.users.id`.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | FK → auth.users.id, CASCADE |
| username | text | Unique (case-insensitive), 4–32 chars |
| first_name | text | 4–32 chars |
| last_name | text | 4–32 chars |
| email | text | Unique (case-insensitive) |
| phone | text | Nullable |
| avatar_url | text | Nullable |
| avatar_path | text | Nullable (storage path) |
| avatar_updated_at | timestamptz | Nullable |
| is_admin | boolean | Default false |
| is_blocked | boolean | Default false |
| is_active | boolean | Default true |
| reputation | integer | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

#### `communities`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| name | text | Unique (case-insensitive), 4–64 chars, must start with `f/` |
| description | text | Max 500 chars, default empty |
| creator_id | uuid | FK → profiles.id, CASCADE |
| member_count | integer | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

#### `community_members`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| community_id | uuid | FK → communities.id, CASCADE |
| user_id | uuid | FK → profiles.id, CASCADE |
| joined_at | timestamptz | Default now() |

Unique constraint on `(community_id, user_id)`.

#### `posts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| author_id | uuid | FK → profiles.id, CASCADE |
| community_id | uuid | FK → communities.id, CASCADE, nullable |
| title | text | 16–64 chars |
| content | text | 32–8192 chars |
| score | integer | Default 0 |
| comment_count | integer | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

#### `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| post_id | uuid | FK → posts.id, CASCADE |
| author_id | uuid | FK → profiles.id, CASCADE |
| content | text | 1–8192 chars |
| score | integer | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

#### `votes`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| voter_id | uuid | FK → profiles.id, CASCADE |
| target_type | vote_target (enum) | `'post'` or `'comment'` |
| target_id | uuid | References a post or comment |
| value | integer | `1` (upvote) or `-1` (downvote) |
| created_at | timestamptz | Default now() |

Unique constraint on `(voter_id, target_type, target_id)`.

#### `notifications`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| recipient_id | uuid | FK → profiles.id, CASCADE |
| actor_id | uuid | FK → profiles.id, CASCADE |
| post_id | uuid | FK → posts.id, CASCADE, nullable |
| comment_id | uuid | FK → comments.id, CASCADE, nullable |
| type | text | `'upvote'`, `'downvote'`, or `'comment'` |
| is_read | boolean | Default false |
| created_at | timestamptz | Default now() |

#### `reports`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| reporter_id | uuid | FK → profiles.id, CASCADE |
| post_id | uuid | FK → posts.id, CASCADE, nullable |
| comment_id | uuid | FK → comments.id, CASCADE, nullable |
| reason | text | `'harassment'`, `'violence'`, or `'hate'` |
| is_reviewed | boolean | Default false |
| created_at | timestamptz | Default now() |

Check constraint: exactly one of `post_id` or `comment_id` must be set (not both, not neither).

#### `user_roles`

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | uuid (PK) | FK → profiles.id, CASCADE |
| role | text | `'user'` or `'admin'` |

### Custom Types

#### `vote_target` (enum)

```sql
CREATE TYPE public.vote_target AS ENUM ('post', 'comment');
```

### Row Level Security

All tables have RLS enabled. Key policies:

- **profiles** — Users can read all profiles; users can update only their own
- **posts / comments** — Authenticated users can create; authors can update/delete their own; admins can delete any
- **votes** — Authenticated users can manage their own votes
- **communities** — Creators and admins can manage; authenticated users can read
- **community_members** — Members can manage their own membership
- **notifications** — Users can only read/update their own notifications
- **reports** — Any authenticated user can insert; only admins can read and update

### Realtime

Supabase Realtime is enabled on `posts`, `comments`, `notifications`, `votes`, and `reports` for live updates across the UI (feed, notifications bell, admin dashboard).

---

## Project Structure

```
forum-system/
├── public/                    # Static assets
├── supabase/
│   ├── functions/             # Edge Functions (delete-user)
│   └── migrations/            # SQL migrations
├── src/
│   ├── api/                   # Supabase API modules
│   │   ├── admin.js           # Admin CRUD operations
│   │   ├── comments.js        # Comment CRUD
│   │   ├── communities.js     # Community CRUD + membership + search
│   │   ├── notifications.js   # Notification queries + realtime
│   │   ├── posts.js           # Post CRUD + queries
│   │   ├── postMedia.js       # Post media helpers
│   │   ├── reports.js         # Report CRUD + realtime
│   │   ├── supabaseClient.js  # Supabase client init
│   │   ├── useRealtimePosts.js# Realtime post subscription hook
│   │   └── votes.js           # Vote upsert/delete
│   ├── components/
│   │   ├── admin/             # Admin dashboard, reports, stats
│   │   ├── auth/              # Login, Register, shared auth UI
│   │   ├── communities/       # Community pages, lists, search
│   │   ├── footer/            # Footer, FAQ, Privacy, Terms, Contact
│   │   ├── home/              # Landing page, stats, feature list
│   │   ├── navigation/        # Navbar, sidebar, notifications
│   │   ├── posting/           # Posts, comments, voting, filters
│   │   ├── shared/            # Reusable modals (delete, report)
│   │   ├── theme/             # Dark/light theme context + toggle
│   │   └── userProfile/       # Profile view, edit, avatar, delete
│   ├── test/                  # Test setup + helpers
│   ├── App.jsx                # Route definitions
│   ├── index.css              # Global styles + theme variables
│   └── main.jsx               # React entry point
├── .env                       # Supabase credentials (not committed)
├── vite.config.js             # Vite + Vitest config
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint with ESLint |
