import { API_CONFIG } from '../config/api';
import { Review } from '../types/notebazaar';

const API_URL = `${API_CONFIG.API_BASE_URL}/reviews`;

export const fetchReviewsForNote = async (noteId: number): Promise<{ reviews: Review[]; averageRating: number; totalReviews: number }> => {
  const res = await fetch(`${API_URL}/note/${noteId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
};

export const createReview = async (noteId: number, rating: number, comment: string, token: string): Promise<Review> => {
  const res = await fetch(`${API_URL}/note/${noteId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
};

export const updateReview = async (reviewId: number, rating: number, comment: string, token: string): Promise<Review> => {
  const res = await fetch(`${API_URL}/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) throw new Error('Failed to update review');
  return res.json();
};

export const deleteReview = async (reviewId: number, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete review');
}; 