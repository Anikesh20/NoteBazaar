import { useCallback, useState } from 'react';
import { Review } from '../types/review';
import { useAuth } from './useAuth';

export const useReviewService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getNoteReviews = useCallback(async (
    noteId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; average_rating: number }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/note/${noteId}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      return {
        reviews: data.reviews,
        total: data.total,
        average_rating: data.average_rating,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserReviews = useCallback(async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number }> => {
    if (!user) {
      throw new Error('You must be logged in to fetch your reviews');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/user?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user reviews');
      }

      const data = await response.json();
      return {
        reviews: data.reviews,
        total: data.total,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createReview = useCallback(async (
    noteId: string,
    reviewData: {
      rating: number;
      comment: string;
    }
  ): Promise<Review> => {
    if (!user) {
      throw new Error('You must be logged in to create reviews');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            note_id: noteId,
            ...reviewData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create review');
      }

      const data = await response.json();
      return data.review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateReview = useCallback(async (
    reviewId: string,
    updates: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> => {
    if (!user) {
      throw new Error('You must be logged in to update reviews');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/${reviewId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      const data = await response.json();
      return data.review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteReview = useCallback(async (reviewId: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to delete reviews');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    getNoteReviews,
    getUserReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}; 