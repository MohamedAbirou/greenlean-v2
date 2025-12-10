/**
 * useInfiniteScroll Hook
 * Production-ready infinite scroll with loading states
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (limit: number, offset: number) => Promise<T[]>;
  initialLimit?: number;
  pageSize?: number;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  initialLimit = 20,
  pageSize = 20,
}: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offset = useRef(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchFunction(pageSize, offset.current);

      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => [...prev, ...newData]);
      offset.current += newData.length;
    } catch (err) {
      setError(err as Error);
      console.error('Error loading more data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, pageSize, isLoading, hasMore]);

  const refresh = useCallback(async () => {
    offset.current = 0;
    setData([]);
    setHasMore(true);
    setError(null);
    await loadMore();
  }, [loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Initial load
  useEffect(() => {
    if (data.length === 0 && !isLoading && hasMore) {
      loadMore();
    }
  }, []);

  return {
    data,
    isLoading,
    hasMore,
    error,
    observerTarget,
    loadMore,
    refresh,
  };
}
