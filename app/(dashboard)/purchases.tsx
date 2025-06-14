import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useUserService } from '../hooks/useUserService';
import { colors, shadows } from '../styles/theme';

interface PurchasedNote {
  id: string;
  note_title: string;
  price: number;
  purchased_at: string;
  seller_name: string;
}

export default function PurchasesScreen() {
  const router = useRouter();
  const { getPurchasedNotes } = useUserService();
  const [notes, setNotes] = useState<PurchasedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async (shouldRefresh: boolean = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      }

      const { notes: newNotes } = await getPurchasedNotes();
      setNotes(newNotes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchased notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleRefresh = () => {
    loadNotes(true);
  };

  const renderNoteCard = ({ item, index }: { item: PurchasedNote; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.noteCard}
    >
      <TouchableOpacity
        style={styles.noteCardContent}
        onPress={() => router.push({
          pathname: '/(dashboard)/note-details',
          params: { id: item.id }
        })}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.note_title}
          </Text>
          <Text style={styles.notePrice}>Rs. {item.price}</Text>
        </View>
        <View style={styles.noteMeta}>
          <Text style={styles.purchaseDate}>
            Purchased on {new Date(item.purchased_at).toLocaleDateString()}
          </Text>
          <Text style={styles.sellerName}>by {item.seller_name}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing && notes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading purchased notes...</Text>
      </View>
    );
  }

  if (error && notes.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyText}>No Purchased Notes</Text>
        <Text style={styles.emptySubtext}>
          You haven't purchased any notes yet. Browse our collection to find great study materials!
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(dashboard)/browse')}
        >
          <Text style={styles.browseButtonText}>Browse Notes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => `purchased-note-${item.id}`}
        contentContainerStyle={styles.notesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notesList: {
    padding: 16,
    gap: 16,
  },
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  noteCardContent: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  notePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  sellerName: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 