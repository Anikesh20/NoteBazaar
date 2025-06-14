import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Review } from '../types/review';
import { Rating } from './Rating';

interface ReviewListProps {
  noteId: string;
  onReviewPress?: (review: Review) => void;
  showUserActions?: boolean;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onEditReview?: (review: Review) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  noteId,
  onReviewPress,
  showUserActions = false,
  onDeleteReview,
  onEditReview,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadReviews = async (pageNum: number = 1) => {
    try {
      setIsLoading(pageNum === 1);
      setIsLoadingMore(pageNum > 1);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reviews/note/${noteId}?page=${pageNum}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }

      const data = await response.json();
      const newReviews = data.reviews;

      if (pageNum === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setHasMore(newReviews.length === 10);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [noteId]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadReviews(page + 1);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!onDeleteReview) return;

    try {
      await onDeleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const renderReview = ({ item: review }: { item: Review }) => (
    <Pressable
      style={styles.reviewContainer}
      onPress={() => onReviewPress?.(review)}
      disabled={!onReviewPress}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {review.user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{review.user_name}</Text>
            <Text style={styles.reviewDate}>
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </Text>
          </View>
        </View>

        {showUserActions && review.is_owner && (
          <View style={styles.actions}>
            <Pressable
              onPress={() => onEditReview?.(review)}
              style={styles.actionButton}
              hitSlop={8}
            >
              <MaterialIcons name="edit" size={18} color="#6b7280" />
            </Pressable>
            <Pressable
              onPress={() => handleDelete(review.id)}
              style={styles.actionButton}
              hitSlop={8}
            >
              <MaterialIcons name="delete" size={18} color="#ef4444" />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.ratingContainer}>
        <Rating value={review.rating} size="small" readonly />
        {review.is_verified_purchase && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color="#2563eb" />
            <Text style={styles.verifiedText}>Verified Purchase</Text>
          </View>
        )}
      </View>

      <Text style={styles.reviewText}>{review.comment}</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={24} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => loadReviews(1)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="rate-review" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No reviews yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to review this note
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator style={styles.loadingMore} color="#2563eb" />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  reviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#2563eb',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
}); 