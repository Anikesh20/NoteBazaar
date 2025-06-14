import { useCallback, useState } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
  onPageChange,
  onLimitChange,
}: PaginationOptions = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalItems);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;

      setPage(newPage);
      onPageChange?.(newPage);
    },
    [totalPages, onPageChange]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(page + 1);
    }
  }, [page, hasNextPage, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(page - 1);
    }
  }, [page, hasPreviousPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const changeLimit = useCallback(
    (newLimit: number) => {
      if (newLimit < 1) return;

      setLimit(newLimit);
      setPage(1); // Reset to first page when changing limit
      onLimitChange?.(newLimit);
    },
    [onLimitChange]
  );

  const getPageRange = useCallback(
    (range: number = 2): number[] => {
      const rangeStart = Math.max(1, page - range);
      const rangeEnd = Math.min(totalPages, page + range);

      return Array.from(
        { length: rangeEnd - rangeStart + 1 },
        (_, i) => rangeStart + i
      );
    },
    [page, totalPages]
  );

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  const state: PaginationState = {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };

  return {
    ...state,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    changeLimit,
    getPageRange,
    resetPagination,
  };
}; 