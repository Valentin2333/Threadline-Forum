import { useRef, useCallback, useEffect } from "react";

const useInfiniteScroll = ({ hasMore, loading, onLoadMore }) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const sentinelCallback = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      sentinelRef.current = node;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        },
        { rootMargin: "200px" },
      );

      observerRef.current.observe(node);
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelCallback;
};

export default useInfiniteScroll;