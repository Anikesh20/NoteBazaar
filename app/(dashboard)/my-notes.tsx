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
    View,
} from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useNoteService } from '../hooks/useNoteService';
import { colors, shadows } from '../styles/theme';

interface Note {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'published' | 'draft' | 'pending';
  purchase_count: number;
  earnings: number;
  created_at: string;
}

export default function MyNotesScreen() {
  const router = useRouter();
  const { getMyNotes, deleteNote } = useNoteService();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'pending'>('all');

  const loadNotes = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const fetchedNotes = await getMyNotes();
      setNotes(fetchedNotes);
    } catch (err: any) {
      console.error('Error loading notes:', err);
      setError(err.message || 'Failed to load notes');
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

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Error deleting note:', err);
      // Show error toast or alert
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedStatus === 'all') return true;
    return note.status === selectedStatus;
  });

  const renderNoteCard = ({ item, index }: { item: Note; index: number }) => (
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
          <View style={styles.titleContainer}>
            <Text style={styles.noteTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, styles[`${item.status}Badge`]]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.notePrice}>Rs. {item.price}</Text>
        </View>

        <Text style={styles.noteDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.noteStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={colors.textLight} />
            <Text style={styles.statText}>{item.purchase_count} purchases</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="wallet-outline" size={16} color={colors.success} />
            <Text style={[styles.statText, styles.earningsText]}>
              Rs. {item.earnings} earned
            </Text>
          </View>
        </View>

        <View style={styles.noteActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push({
              pathname: '/(dashboard)/upload',
              params: { id: item.id }
            })}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, styles.editButtonText]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteNote(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {(['all', 'published', 'draft', 'pending'] as const).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterChip,
            selectedStatus === status && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus(status)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === status && styles.filterChipTextActive,
            ]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your notes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadNotes()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatusFilter()}

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'all'
                ? "You haven't uploaded any notes yet"
                : `No ${selectedStatus} notes found`}
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/(dashboard)/upload')}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Note</Text>
            </TouchableOpacity>
          </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
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
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: colors.success + '20',
  },
  draftBadge: {
    backgroundColor: colors.warning + '20',
  },
  pendingBadge: {
    backgroundColor: colors.info + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noteDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  noteStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: colors.textLight,
  },
  earningsText: {
    color: colors.success,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: colors.danger + '20',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonText: {
    color: colors.primary,
  },
  deleteButtonText: {
    color: colors.danger,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 