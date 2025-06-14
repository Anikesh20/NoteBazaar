import { useCallback, useEffect, useState } from 'react';
import { Note } from '../types/note';
import { useDebounce } from './useDebounce';

export const useSearchService = (
  initialQuery: string = '',
  debounceMs: number = 300
) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedQuery = useDebounce(query, debounceMs);

  const searchNotes = useCallback(async (
    searchQuery: string,
    pageNum: number = 1,
    limit: number = 10,
    filters?: {
      program?: string;
      semester?: string;
      subject?: string;
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
    }
  ): Promise<{ notes: Note[]; total: number }> => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        q: searchQuery,
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(filters?.program && { program: filters.program }),
        ...(filters?.semester && { semester: filters.semester }),
        ...(filters?.subject && { subject: filters.subject }),
        ...(filters?.minPrice && { min_price: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { max_price: filters.maxPrice.toString() }),
        ...(filters?.rating && { rating: filters.rating.toString() }),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notes/search?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to search notes');
      }

      const data = await response.json();
      return {
        notes: data.notes,
        total: data.total,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search notes');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      const nextPage = page + 1;
      const { notes: newNotes, total: newTotal } = await searchNotes(
        debouncedQuery,
        nextPage
      );

      setResults(prev => [...prev, ...newNotes]);
      setTotal(newTotal);
      setPage(nextPage);
      setHasMore(newNotes.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more results');
    }
  }, [debouncedQuery, page, hasMore, isLoading, searchNotes]);

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      try {
        setPage(1);
        const { notes, total: newTotal } = await searchNotes(debouncedQuery, 1);
        setResults(notes);
        setTotal(newTotal);
        setHasMore(notes.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to perform search');
      }
    };

    performSearch();
  }, [debouncedQuery, searchNotes]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    total,
    hasMore,
    loadMore,
    resetSearch,
  };
}; 