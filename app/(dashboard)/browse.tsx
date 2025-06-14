import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useNoteService } from '../hooks/useNoteService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

interface Note {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  purchase_count: number;
  seller_name: string;
  created_at: string;
}

export default function BrowseScreen() {
  const router = useRouter();
  const { getNotes } = useNoteService();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const loadNotes = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters = {
        search: searchQuery,
        program: selectedProgram,
        semester: selectedSemester,
        subject: selectedSubject,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };

      const fetchedNotes = await getNotes(filters);
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
  }, [searchQuery, selectedProgram, selectedSemester, selectedSubject, priceRange]);

  const handleRefresh = () => {
    loadNotes(true);
  };

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
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.notePrice}>Rs. {item.price}</Text>
        </View>
        <Text style={styles.noteDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.noteMeta}>
          <View style={styles.noteStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={colors.textLight} />
              <Text style={styles.statText}>{item.purchase_count} bought</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.sellerName}>by {item.seller_name}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      <TouchableOpacity
        style={[styles.filterChip, selectedProgram === null && styles.filterChipActive]}
        onPress={() => setSelectedProgram(null)}
      >
        <Text style={[styles.filterChipText, selectedProgram === null && styles.filterChipTextActive]}>
          All Programs
        </Text>
      </TouchableOpacity>
      {/* Add more program filters */}
      
      <TouchableOpacity
        style={[styles.filterChip, selectedSemester === null && styles.filterChipActive]}
        onPress={() => setSelectedSemester(null)}
      >
        <Text style={[styles.filterChipText, selectedSemester === null && styles.filterChipTextActive]}>
          All Semesters
        </Text>
      </TouchableOpacity>
      {/* Add more semester filters */}
      
      <TouchableOpacity
        style={[styles.filterChip, selectedSubject === null && styles.filterChipActive]}
        onPress={() => setSelectedSubject(null)}
      >
        <Text style={[styles.filterChipText, selectedSubject === null && styles.filterChipTextActive]}>
          All Subjects
        </Text>
      </TouchableOpacity>
      {/* Add more subject filters */}
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading notes...</Text>
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Notes List */}
      <FlatList
        data={notes}
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
              Try adjusting your search or filters
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    height: 48,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
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
  noteDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteStats: {
    flexDirection: 'row',
    gap: 12,
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
  },
}); 