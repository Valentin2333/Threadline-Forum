import { useMemo, useState } from "react";

const normalize = (s) => (s ?? "").toString().toLowerCase().trim();

const usePostFilters = ({ posts, userId }) => {
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("any");

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const displayedPosts = useMemo(() => {
    const q = normalize(searchQuery);

    let list = (posts ?? []).slice();

    if (authorFilter === "mine") {
      list = list.filter((p) => Boolean(userId && p.author_id === userId));
    }

    if (scoreFilter !== "any") {
      const score = (p) => Number(p?.score ?? 0);
      const threshold =
        scoreFilter === "gte1"
          ? 1
          : scoreFilter === "gte10"
            ? 10
            : scoreFilter === "gte100"
              ? 100
              : 0;
      list = list.filter((p) => score(p) >= threshold);
    }

    if (q) {
      list = list.filter((p) => {
        const title = normalize(p.title);
        const content = normalize(p.content);
        const author = normalize(p.post_author?.username);
        return title.includes(q) || content.includes(q) || author.includes(q);
      });
    }

    const createdAt = (p) => new Date(p?.created_at ?? 0).getTime();
    const score = (p) => Number(p?.score ?? 0);
    const commentsCount = (p) => (p.comments ?? []).length;

    list.sort((a, b) => {
      if (sortBy === "newest") return createdAt(b) - createdAt(a);
      if (sortBy === "oldest") return createdAt(a) - createdAt(b);
      if (sortBy === "score") {
        const d = score(b) - score(a);
        return d !== 0 ? d : createdAt(b) - createdAt(a);
      }
      if (sortBy === "comments") {
        const d = commentsCount(b) - commentsCount(a);
        return d !== 0 ? d : createdAt(b) - createdAt(a);
      }
      return createdAt(b) - createdAt(a);
    });

    return list;
  }, [posts, searchQuery, sortBy, authorFilter, scoreFilter, userId]);

  const clearControls = () => {
    setSortBy("newest");
    setSearchQuery("");
    setAuthorFilter("all");
    setScoreFilter("any");
  };

  const hasActiveSearch = !!searchQuery.trim();
  const hasActiveFilters =
    sortBy !== "newest" || authorFilter !== "all" || scoreFilter !== "any";

  return {
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    authorFilter,
    setAuthorFilter,
    scoreFilter,
    setScoreFilter,
    showSearch,
    setShowSearch,
    showFilters,
    setShowFilters,
    displayedPosts,
    clearControls,
    hasActiveSearch,
    hasActiveFilters,
  };
};

export default usePostFilters;
