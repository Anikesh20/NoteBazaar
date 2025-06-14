import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Note } from '../types/note';
import { formatCurrency } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  variant?: 'grid' | 'list';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, variant = 'grid' }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/note/${note.id}`);
  };

  return (
    <Pressable 
      style={[styles.container, variant === 'list' && styles.listContainer]} 
      onPress={handlePress}
    >
      <View style={[styles.imageContainer, variant === 'list' && styles.listImageContainer]}>
        <Image
          source={{ uri: note.thumbnail_url || 'https://via.placeholder.com/150' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {note.is_premium && (
          <View style={styles.premiumBadge}>
            <MaterialIcons name="star" size={12} color="#FFD700" />
          </View>
        )}
      </View>

      <View style={[styles.content, variant === 'list' && styles.listContent]}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>
        
        <Text style={styles.subject} numberOfLines={1}>
          {note.subject_name}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{note.average_rating?.toFixed(1) || 'New'}</Text>
            <Text style={styles.reviewCount}>
              ({note.review_count || 0})
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <FontAwesome5 name="download" size={12} color="#666" />
              <Text style={styles.statText}>{note.download_count || 0}</Text>
            </View>
            <View style={styles.stat}>
              <FontAwesome5 name="file-pdf" size={12} color="#666" />
              <Text style={styles.statText}>
                {Math.round((note.file_size || 0) / 1024)}KB
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {note.is_premium ? formatCurrency(note.price) : 'Free'}
          </Text>
          <View style={styles.sellerContainer}>
            <Image
              source={{ uri: note.seller_avatar || 'https://via.placeholder.com/24' }}
              style={styles.sellerAvatar}
            />
            <Text style={styles.sellerName} numberOfLines={1}>
              {note.seller_name}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  listContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  listImageContainer: {
    width: 120,
    height: 120,
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    padding: 12,
  },
  listContent: {
    flex: 1,
    padding: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    maxWidth: 100,
  },
}); 