import { Ionicons } from '@expo/vector-icons';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets as useSafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useNoteService } from '../hooks/useNoteService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RH1RtLnm2eBVvTqnVeoBJepGyBj8cS0kFdlFgzwwcT66NRtDpyywesUqWZv08tfQQw3KlWPnqvrtBeq89ok5jXy00kkZ0iHlS';

interface MenuItem {
  title: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

interface QuickAction {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface Note {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  earnings: number;
  purchase_count: number;
  created_at: string;
}

interface Purchase {
  id: string;
  note_title: string;
  price: number;
  purchased_at: string;
  seller_name: string;
}

interface Earning {
  id: string;
  note_title: string;
  amount: number;
  earned_at: string;
  buyer_name: string;
}

interface TrendingNote {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  purchase_count: number;
  seller_name: string;
}

type StatItem = {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type Styles = {
  container: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  headerTitleContainer: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  profileButton: ViewStyle;
  profileImage: ImageStyle;
  profilePlaceholder: ViewStyle;
  menuButton: ViewStyle;
  menuContainer: ViewStyle;
  menuItem: ViewStyle;
  menuItemText: TextStyle;
  menuOverlay: ViewStyle;
  menuHeader: ViewStyle;
  menuCloseButton: ViewStyle;
  menuTitle: TextStyle;
  menuItems: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  quickActionsSection: ViewStyle;
  quickActionsScrollContainer: ViewStyle;
  quickActionsPage: ViewStyle;
  quickActionsRow: ViewStyle;
  cardSection: ViewStyle;
  sectionTitleContainer: ViewStyle;
  sectionTitleWrapper: ViewStyle;
  sectionTitle: TextStyle;
  sectionSubtitle: TextStyle;
  seeAllButton: ViewStyle;
  seeAllText: TextStyle;
  iconCircle: ViewStyle;
  emptySection: ViewStyle;
  emptySectionText: TextStyle;
  browseButton: ViewStyle;
  browseButtonText: TextStyle;
  purchasesContainer: ViewStyle;
  purchaseCard: ViewStyle;
  purchaseContent: ViewStyle;
  purchaseTitle: TextStyle;
  purchaseMeta: TextStyle;
  purchaseSeller: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  notesLoadingContainer: ViewStyle;
  notesLoadingText: TextStyle;
  notesErrorContainer: ViewStyle;
  notesErrorText: TextStyle;
  noNotesContainer: ViewStyle;
  noNotesText: TextStyle;
  noNotesSubtext: TextStyle;
  uploadButton: ViewStyle;
  uploadButtonText: TextStyle;
  notesContainer: ViewStyle;
  noteCard: ViewStyle;
  noteCardContent: ViewStyle;
  noteTitle: TextStyle;
  noteDescription: TextStyle;
  noteMeta: ViewStyle;
  notePrice: TextStyle;
  noteDate: TextStyle;
  trendingSection: ViewStyle;
  trendingContainer: ViewStyle;
  trendingCard: ViewStyle;
  trendingContent: ViewStyle;
  trendingTitle: TextStyle;
  trendingDescription: TextStyle;
  trendingMeta: ViewStyle;
  trendingStats: ViewStyle;
  trendingPrice: TextStyle;
  paginationContainer: ViewStyle;
  paginationDot: ViewStyle;
  paginationDotActive: ViewStyle;
  actionCard: ViewStyle;
  actionIconFloating: ViewStyle;
  actionText: TextStyle;
  statItem: ViewStyle;
  statText: TextStyle;
  statsGrid: ViewStyle;
  statContent: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  statsLoadingContainer: ViewStyle;
  statsLoadingText: TextStyle;
  statsErrorContainer: ViewStyle;
  statsErrorText: TextStyle;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { getMyNotes, getRecentPurchases, getRecentEarnings, getTrendingNotes } = useNoteService();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<{ total: number; recent: number }>({ total: 0, recent: 0 });
  const [trendingNotes, setTrendingNotes] = useState<TrendingNote[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsetsContext();
  const { height: windowHeight } = useWindowDimensions();
  const [shouldAddPadding, setShouldAddPadding] = useState(false);
  const [activeTrendingIndex, setActiveTrendingIndex] = useState(0);
  const trendingScrollViewRef = useRef<ScrollView>(null);
  const [activeQuickActionIndex, setActiveQuickActionIndex] = useState(0);
  const quickActionsScrollViewRef = useRef<ScrollView>(null);

  const handleDashboardScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
  };

  const handleContentSizeChange = (width: number, height: number) => {
    contentHeight.value = height;
    const bottomInset = insets.bottom || 0;
    setShouldAddPadding(height < windowHeight - bottomInset);
  };

  const handleLayout = (event: any) => {
    scrollViewHeight.value = event.nativeEvent.layout.height;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const bottomInset = insets.bottom || 0;
    const paddingTriggered = layoutMeasurement.height + contentOffset.y >= contentSize.height - (bottomInset + 20);
    setShouldAddPadding(paddingTriggered);
  };

  const handleTrendingScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffset / viewSize);
    setActiveTrendingIndex(index);
  };

  const scrollToTrendingIndex = (index: number) => {
    if (trendingScrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      trendingScrollViewRef.current.scrollTo({
        x: index * (screenWidth - 32), // Account for padding
        animated: true,
      });
    }
  };

  const handleQuickActionsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffset / viewSize);
    setActiveQuickActionIndex(index);
  };

  const scrollToQuickActionIndex = (index: number) => {
    if (quickActionsScrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      quickActionsScrollViewRef.current.scrollTo({
        x: index * (screenWidth - 32), // Account for padding
        animated: true,
      });
    }
  };

  const loadMyNotes = async () => {
    try {
      setLoadingNotes(true);
      setNotesError(null);
      const notes = await getMyNotes();
      setMyNotes(notes);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      setNotesError(error.message || 'Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [purchases, earnings, trending] = await Promise.all([
        getRecentPurchases(),
        getRecentEarnings(),
        getTrendingNotes()
      ]);

      // Map purchases to the correct format
      const formattedPurchases = purchases.map(note => ({
        id: note.id,
        note_title: note.title,
        price: note.price,
        purchased_at: note.created_at,
        seller_name: note.seller_name
      }));

      setRecentPurchases(formattedPurchases);
      setRecentEarnings(earnings);
      setTrendingNotes(trending);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyNotes();
    loadDashboardData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const menuItems: MenuItem[] = [
    {
      title: 'My Profile',
      icon: 'person',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/profile');
      }
    },
    {
      title: 'My Notes',
      icon: 'document-text',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/my-notes');
      }
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/settings');
      }
    },
    {
      title: 'Logout',
      icon: 'log-out',
      onPress: async () => {
        setMenuVisible(false);
        try {
          await signOut();
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Browse Notes',
      icon: 'search-outline',
      color: '#007AFF',
      onPress: () => router.push('/(dashboard)/browse'),
    },
    {
      title: 'My Notes',
      icon: 'document-text-outline',
      color: '#34C759',
      onPress: () => router.push('/(dashboard)/my-notes'),
    },
    {
      title: 'Upload Note',
      icon: 'cloud-upload-outline',
      color: '#FF9500',
      onPress: () => router.push('/(dashboard)/upload'),
    },
    {
      title: 'Wallet',
      icon: 'wallet-outline',
      color: '#5856D6',
      onPress: () => router.push('/(dashboard)/wallet'),
    },
    {
      title: 'Profile',
      icon: 'person-outline',
      color: '#FF2D55',
      onPress: () => router.push('/(dashboard)/profile'),
    },
    {
      title: 'Settings',
      icon: 'settings-outline',
      color: '#8E8E93',
      onPress: () => router.push('/(dashboard)/settings'),
    },
  ];

  const renderNotesSection = () => {
    if (loadingNotes) {
      return (
        <View style={styles.notesLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.notesLoadingText}>Loading your notes...</Text>
        </View>
      );
    }

    if (notesError) {
      return (
        <View style={styles.notesErrorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          <Text style={styles.notesErrorText}>{notesError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              loadMyNotes();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (myNotes.length === 0) {
      return (
        <View style={styles.noNotesContainer}>
          <Ionicons name="document-text-outline" size={32} color={colors.success} />
          <Text style={styles.noNotesText}>No notes yet</Text>
          <Text style={styles.noNotesSubtext}>Start uploading your notes to share with others</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push('/(dashboard)/upload')}
          >
            <Text style={styles.uploadButtonText}>Upload Note</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.notesContainer}
      >
        {myNotes.map((note: any, index: number) => (
          <Animated.View
            key={note.id}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              style={styles.noteCard}
              onPress={() => router.push({
                pathname: '/(dashboard)/note-details',
                params: { id: note.id }
              })}
            >
              <View style={styles.noteCardContent}>
                <Text style={styles.noteTitle} numberOfLines={2}>
                  {note.title}
                </Text>
                <Text style={styles.noteDescription} numberOfLines={3}>
                  {note.description}
                </Text>
                <View style={styles.noteMeta}>
                  <Text style={styles.notePrice}>Rs. {note.price}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    );
  };

  const renderStatsSection = () => {
    const stats = [
      {
        id: 'recent',
        label: 'Recent Earnings',
        value: `Rs. ${recentEarnings.recent}`,
        icon: 'trending-up-outline',
        color: colors.primary
      },
      {
        id: 'notes',
        label: 'My Notes',
        value: myNotes.length.toString(),
        icon: 'document-text-outline',
        color: colors.warning
      },
      {
        id: 'purchases',
        label: 'Purchases',
        value: recentPurchases.length.toString(),
        icon: 'cart-outline',
        color: colors.secondary
      }
    ];

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 16 }}>
        {stats.map((stat) => (
          <View 
            key={stat.id}
            style={{
              flex: 1,
              minWidth: '45%',
              padding: 16,
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon as any} size={20} color="#fff" />
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textLight }}>
                {stat.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentPurchases = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading purchases...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (recentPurchases.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Ionicons name="cart-outline" size={32} color={colors.textLight} />
          <Text style={styles.emptySectionText}>No recent purchases</Text>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.purchasesContainer}
      >
        {recentPurchases.map((purchase) => (
          <TouchableOpacity
            key={`recent-purchase-${purchase.id}`}
            style={styles.purchaseCard}
            onPress={() => router.push({
              pathname: '/(dashboard)/note-details',
              params: { id: purchase.id }
            })}
          >
            <View style={styles.purchaseContent}>
              <Text style={styles.purchaseTitle} numberOfLines={2}>
                {purchase.note_title}
              </Text>
              <Text style={styles.purchaseMeta}>
                Rs. {purchase.price} • {new Date(purchase.purchased_at).toLocaleDateString()}
              </Text>
              <Text style={styles.purchaseSeller}>by {purchase.seller_name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTrendingNotes = () => {
    if (trendingNotes.length === 0) {
      return null;
    }

    return (
      <View style={styles.trendingSection}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionTitleWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="trending-up" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Trending Notes</Text>
              <Text style={styles.sectionSubtitle}>
                {trendingNotes.length} {trendingNotes.length === 1 ? 'note' : 'notes'} trending
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/(dashboard)/browse')}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={trendingScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleTrendingScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={Dimensions.get('window').width - 32} // Account for padding
          snapToAlignment="start"
          contentContainerStyle={styles.trendingContainer}
        >
          {trendingNotes.map((note, index) => (
            <TouchableOpacity
              key={note.id}
              style={styles.trendingCard}
              onPress={() => router.push({
                pathname: '/(dashboard)/note-details',
                params: { id: note.id }
              })}
              activeOpacity={0.7}
            >
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle} numberOfLines={2}>
                  {note.title}
                </Text>
                <Text style={styles.trendingDescription} numberOfLines={3}>
                  {note.description}
                </Text>
                <View style={styles.trendingMeta}>
                  <View style={styles.trendingStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="people-outline" size={16} color={colors.textLight} />
                      <Text style={styles.statText}>{note.purchase_count} bought</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.statText}>{note.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.trendingPrice}>Rs. {note.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.paginationContainer}>
          {trendingNotes.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === activeTrendingIndex && styles.paginationDotActive
              ]}
              onPress={() => scrollToTrendingIndex(index)}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMenuVisible(true);
              }}
            >
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>NoteBazaar</Text>
              <Text style={styles.headerSubtitle}>Share & Learn</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(dashboard)/profile')}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={20} color={colors.text} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            shouldAddPadding && { paddingBottom: (insets.bottom || 0) + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          {/* Quick Actions Section */}
          <Animated.View
            style={styles.quickActionsSection}
            entering={FadeInUp.delay(100).duration(500)}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="flash" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <Text style={styles.sectionSubtitle}>Get started quickly</Text>
                </View>
              </View>
            </View>
            <ScrollView
              ref={quickActionsScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleQuickActionsScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={Dimensions.get('window').width - 32} // Account for padding
              snapToAlignment="start"
              contentContainerStyle={styles.quickActionsScrollContainer}
            >
              {quickActions.map((action: QuickAction, index: number) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 70).duration(400)}
                  style={styles.quickActionsPage}
                >
                  <View style={styles.quickActionsRow}>
                    {quickActions.slice(index * 3, (index + 1) * 3).map((action, actionIndex) => (
                      <TouchableOpacity
                        key={actionIndex}
                        style={styles.actionCard}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          action.onPress();
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.actionIconFloating, { backgroundColor: action.color }]}>
                          <Ionicons name={action.icon as any} size={26} color="#fff" />
                        </View>
                        <Text style={[styles.actionText, { color: action.color }]}>{action.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
            <View style={styles.paginationContainer}>
              {Array.from({ length: Math.ceil(quickActions.length / 3) }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeQuickActionIndex && styles.paginationDotActive
                  ]}
                  onPress={() => scrollToQuickActionIndex(index)}
                />
              ))}
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View
            style={styles.cardSection}
            entering={FadeInUp.delay(200).duration(500)}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="stats-chart" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Statistics</Text>
                  <Text style={styles.sectionSubtitle}>Your activity overview</Text>
                </View>
              </View>
            </View>
            {renderStatsSection()}
          </Animated.View>

          {/* Recent Purchases */}
          <Animated.View
            style={styles.cardSection}
            entering={FadeInUp.delay(300).duration(500)}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="cart" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Recent Purchases</Text>
                  <Text style={styles.sectionSubtitle}>
                    {isLoading ? 'Loading...' : 
                     recentPurchases.length === 0 ? 'No purchases yet' :
                     `${recentPurchases.length} ${recentPurchases.length === 1 ? 'note' : 'notes'} bought`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(dashboard)/purchases")}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {renderRecentPurchases()}
          </Animated.View>

          {/* My Notes Section */}
          <Animated.View
            style={styles.cardSection}
            entering={FadeInUp.delay(400).duration(500)}
          >
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="document-text" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>My Notes</Text>
                  <Text style={styles.sectionSubtitle}>
                    {myNotes.length} {myNotes.length === 1 ? 'note' : 'notes'} uploaded
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push('/(dashboard)/my-notes')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {renderNotesSection()}
          </Animated.View>

          {/* Trending Notes */}
          {renderTrendingNotes()}
        </ScrollView>

        {/* Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <Animated.View
              style={[styles.menuContainer, { transform: [{ translateX: menuVisible ? 0 : -300 }] }]}
              entering={FadeInDown.duration(300)}
            >
              <View style={styles.menuHeader}>
                <TouchableOpacity
                  style={styles.menuCloseButton}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.menuTitle}>Menu</Text>
              </View>
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <Ionicons name={item.icon as any} size={24} color={colors.text} />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsScrollContainer: {
    paddingRight: 16,
  },
  quickActionsPage: {
    width: Dimensions.get('window').width - 32, // Full width minus padding
    marginRight: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconFloating: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  notesContainer: {
    paddingRight: 16,
  },
  noteCard: {
    width: 280,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    ...shadows.small,
  },
  noteCardContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
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
  notePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  notesLoadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  notesLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  notesErrorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  notesErrorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noNotesContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noNotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  noNotesSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsLoadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  statsLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  statsErrorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  statsErrorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
  purchasesContainer: {
    paddingRight: 16,
  },
  purchaseCard: {
    width: 200,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 12,
    padding: 16,
    ...shadows.small,
  },
  purchaseContent: {
    flex: 1,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  purchaseMeta: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  purchaseSeller: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  trendingSection: {
    marginTop: 24,
  },
  trendingContainer: {
    paddingRight: 16,
  },
  trendingCard: {
    width: Dimensions.get('window').width - 32, // Full width minus padding
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    ...shadows.small,
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  trendingDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  trendingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: colors.textLight,
  },
  trendingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  emptySection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  emptySectionText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
});