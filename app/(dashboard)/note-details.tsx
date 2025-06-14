import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNoteService } from '../hooks/useNoteService';
import { colors, shadows } from '../styles/theme';

export default function NoteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNoteDetails, downloadNote, loading, error } = useNoteService();
  const [note, setNote] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(true);

  useEffect(() => {
    loadNoteDetails();
  }, [id]);

  const loadNoteDetails = async () => {
    try {
      const noteData = await getNoteDetails(id as string);
      if (noteData) {
        setNote(noteData);
      }
    } catch (err) {
      console.error('Error loading note details:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const result = await downloadNote(id as string);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      console.error('Error downloading note:', err);
      Alert.alert('Error', 'Failed to download note');
    }
  };

  const handlePurchase = () => {
    // Navigate to payment screen
    router.push({
      pathname: '/(dashboard)/payment',
      params: { noteId: id }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading note details...</Text>
      </View>
    );
  }

  if (error || !note) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>
          {error || 'Note not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadNoteDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Note Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: note.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>{note.title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={16} color={colors.textLight} />
              <Text style={styles.metaText}>{note.program}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
              <Text style={styles.metaText}>{note.semester}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color={colors.textLight} />
              <Text style={styles.metaText}>{note.subject}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Note Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statValue}>{note.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={styles.statValue}>{note.purchase_count}</Text>
          <Text style={styles.statLabel}>Purchases</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={20} color={colors.success} />
          <Text style={styles.statValue}>{note.total_pages}</Text>
          <Text style={styles.statLabel}>Pages</Text>
        </View>
      </View>

      {/* Note Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{note.description}</Text>
      </View>

      {/* Preview Content */}
      {previewMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              This is a preview of the first {note.preview_pages} pages of the note.
              Purchase to access the full content.
            </Text>
            <View style={styles.previewPlaceholder}>
              <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
              <Text style={styles.previewPlaceholderText}>
                Preview Content
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Purchase Section */}
      <View style={styles.purchaseContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>Rs. {note.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.purchaseButtonText}>Purchase Note</Text>
        </TouchableOpacity>
      </View>

      {/* Seller Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About the Seller</Text>
        <View style={styles.sellerContainer}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerInitial}>
              {note.seller_name.charAt(0)}
            </Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{note.seller_name}</Text>
            <Text style={styles.sellerStats}>
              {note.purchase_count} notes sold • {note.rating.toFixed(1)} rating
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    ...shadows.medium,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  headerContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  previewContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  previewText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  previewPlaceholder: {
    height: 200,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  previewPlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textLight,
  },
  purchaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  sellerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sellerStats: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
}); 