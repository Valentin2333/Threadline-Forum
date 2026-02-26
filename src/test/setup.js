import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// ---------- Global mock: Supabase client ----------
vi.mock("../api/supabaseClient", () => {
  const makeMockChain = () => {
    const chain = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      upsert: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      ilike: vi.fn(() => chain),
      or: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn(() => makeMockChain()),
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({ data: { user: null }, error: null }),
        ),
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: null }, error: null }),
        ),
        signInWithPassword: vi.fn(() => Promise.resolve({ error: null })),
        signUp: vi.fn(() => Promise.resolve({ error: null })),
        signOut: vi.fn(() => Promise.resolve()),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn((path) => ({
            data: { publicUrl: `https://storage.example.com/${path}` },
          })),
          upload: vi.fn(() => Promise.resolve({ error: null })),
        })),
      },
      functions: {
        invoke: vi.fn(() => Promise.resolve({ error: null })),
      },
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      })),
      removeChannel: vi.fn(),
    },
  };
});

// ---------- Mock: Supabase-backed API modules ----------
vi.mock("../api/posts", () => ({
  getPostById: vi.fn(() => Promise.resolve(null)),
  createPost: vi.fn(() => Promise.resolve({})),
  updatePost: vi.fn(() => Promise.resolve({})),
  deletePost: vi.fn(() => Promise.resolve(true)),
  getMostCommentedPosts: vi.fn(() => Promise.resolve([])),
  getRecentPostsSummary: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../api/comments", () => ({
  createComment: vi.fn(() => Promise.resolve({})),
  updateComment: vi.fn(() => Promise.resolve({})),
  deleteComment: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("../api/votes", () => ({
  upsertVote: vi.fn(() => Promise.resolve({})),
  deleteVote: vi.fn(() => Promise.resolve()),
  getMyVote: vi.fn(() => Promise.resolve(0)),
}));

vi.mock("../api/admin", () => ({
  searchUsers: vi.fn(() => Promise.resolve([])),
  setUserBlocked: vi.fn(() => Promise.resolve({})),
  deleteAnyPost: vi.fn(() => Promise.resolve(true)),
  getAllPosts: vi.fn(() => Promise.resolve([])),
  getAllCommunities: vi.fn(() => Promise.resolve([])),
  getAdminStats: vi.fn(() =>
    Promise.resolve({
      users: 0,
      posts: 0,
      comments: 0,
      blocked: 0,
      communities: 0,
    }),
  ),
}));

vi.mock("../api/communities", () => ({
  getCommunityByName: vi.fn(() => Promise.resolve(null)),
  getCommunityPosts: vi.fn(() => Promise.resolve([])),
  getTopCommunities: vi.fn(() => Promise.resolve([])),
  getUserCommunities: vi.fn(() => Promise.resolve([])),
  getPostsForJoinedCommunities: vi.fn(() => Promise.resolve([])),
  getCreatedCommunities: vi.fn(() => Promise.resolve([])),
  getCommunityMembers: vi.fn(() => Promise.resolve([])),
  createCommunity: vi.fn(() => Promise.resolve({})),
  joinCommunity: vi.fn(() => Promise.resolve({})),
  leaveCommunity: vi.fn(() => Promise.resolve({})),
  removeMember: vi.fn(() => Promise.resolve({})),
  deleteCommunity: vi.fn(() => Promise.resolve(true)),
  isMember: vi.fn(() => Promise.resolve(false)),
  globalSearch: vi.fn(() => Promise.resolve({ communities: [], posts: [] })),
}));
