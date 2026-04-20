import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  FlatList,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useLocation } from '@/hooks/useLocation';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { RestaurantCard } from '@/components/shared/RestaurantCard';
import { LocationInput } from '@/components/shared/LocationInput';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const CUISINES = [
  { id: 'all', name: 'All', icon: 'restaurant' },
  { id: 'Italian', name: 'Italian', icon: 'pizza' },
  { id: 'Japanese', name: 'Japanese', icon: 'fish' },
  { id: 'Mexican', name: 'Mexican', icon: 'leaf' },
  { id: 'Chinese', name: 'Chinese', icon: 'nutrition' },
  { id: 'American', name: 'Burgers', icon: 'fast-food' },
  { id: 'Healthy', name: 'Healthy', icon: 'heart' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, gradients } = useTheme();
  const { location } = useLocation();
  const user = useAuthStore(state => state.user);
  const {
    restaurants,
    isLoadingRestaurants,
    fetchRestaurants,
    getFilteredRestaurants,
    searchQuery,
    setSearchQuery,
    selectedCuisines,
    setSelectedCuisines,
    cart,
    setUserLocation,
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
  } = useStore();

  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRestaurants();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (location) {
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location]);

  useEffect(() => {
    if (user?.savedAddresses.length && !selectedDeliveryAddress) {
      const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
      setSelectedDeliveryAddress(defaultAddr);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  }, []);

  const handleCuisinePress = (cuisineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (cuisineId === 'all') {
      setSelectedCuisines([]);
    } else if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };

  const toggleMapView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMap(!showMap);
  };

  const filteredRestaurants = getFilteredRestaurants();
  const favoriteRestaurants = restaurants.filter(r => r.isFavorite).slice(0, 5);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <LinearGradient
          colors={gradients.primary as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Pressable style={styles.deliverySelector}>
              <View style={styles.deliveryIcon}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={styles.deliveryTextContainer}>
                <Text style={styles.deliveryLabel}>Deliver to</Text>
                <View style={styles.deliveryAddress}>
                  <Text style={styles.deliveryAddressText} numberOfLines={1}>
                    {selectedDeliveryAddress?.label || 'Select address'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#ffffff" />
                </View>
              </View>
            </Pressable>
            <Pressable style={styles.profileButton}>
              <Image
                source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random' }}
                style={styles.profileImage}
              />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search restaurants or cuisines..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.8)" />
                </Pressable>
              )}
            </View>
            <Pressable
              style={[styles.filterButton, showMap && { backgroundColor: '#ffffff' }]}
              onPress={toggleMapView}
            >
              <Ionicons
                name={showMap ? 'list' : 'map'}
                size={22}
                color={showMap ? colors.primary : '#ffffff'}
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {showMap ? (
        // Map View
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location?.latitude || 37.7749,
              longitude: location?.longitude || -122.4194,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {filteredRestaurants.map(restaurant => (
              <Marker
                key={restaurant.id}
                coordinate={restaurant.coordinates}
                title={restaurant.name}
                description={`${restaurant.rating}⭐ • ${restaurant.deliveryTime}`}
              />
            ))}
          </MapView>
          <View style={[styles.mapOverlay, { bottom: insets.bottom + 100 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mapCards}
            >
              {filteredRestaurants.slice(0, 5).map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="compact" />
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        // List View
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Cuisines */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cuisinesContainer}
            >
              {CUISINES.map(cuisine => {
                const isSelected = cuisine.id === 'all' 
                  ? selectedCuisines.length === 0 
                  : selectedCuisines.includes(cuisine.id);
                return (
                  <Pressable
                    key={cuisine.id}
                    style={[
                      styles.cuisineItem,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => handleCuisinePress(cuisine.id)}
                  >
                    <Ionicons
                      name={cuisine.icon as any}
                      size={20}
                      color={isSelected ? '#ffffff' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.cuisineName,
                        { color: isSelected ? '#ffffff' : colors.text },
                      ]}
                    >
                      {cuisine.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Favorites Section */}
          {favoriteRestaurants.length > 0 && (
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Favorites</Text>
                <Pressable>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favoritesContainer}
              >
                {favoriteRestaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="compact" />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* All Restaurants */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCuisines.length > 0 
                  ? `${selectedCuisines.join(', ')} Restaurants`
                  : 'All Restaurants'
                }
              </Text>
              <Badge label={`${filteredRestaurants.length} found`} variant="default" size="sm" />
            </View>

            {isLoadingRestaurants ? (
              <View>
                {[1, 2, 3].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </View>
            ) : filteredRestaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No restaurants found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Try adjusting your filters or search query
                </Text>
              </View>
            ) : (
              filteredRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
            )}
          </Animated.View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deliverySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  deliveryAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    maxWidth: 200,
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  cuisinesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  cuisineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  cuisineName: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoritesContainer: {
    paddingHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  mapCards: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});