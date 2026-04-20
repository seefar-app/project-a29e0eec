import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { RatingBreakdown } from '@/components/shared/RatingBreakdown';
import { MenuItem } from '@/types';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, gradients } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const selectRestaurant = useStore(state => state.selectRestaurant);
  const selectedRestaurant = useStore(state => state.selectedRestaurant);
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const addToCart = useStore(state => state.addToCart);
  
  const scrollY = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (id) {
      selectRestaurant(id);
    }
  }, [id]);
  
  if (!selectedRestaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });
  
  const categories = selectedRestaurant.menu.map(cat => cat.name);
  
  const handleAddToCart = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(item, 1, [], '');
  };
  
  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(selectedRestaurant.id);
  };
  
  const operatingHours = [
    { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Thursday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 10:00 PM' },
  ];
  
  const mockReviews = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      restaurantId: selectedRestaurant.id,
      orderId: 'order1',
      rating: 5,
      text: 'Absolutely amazing food! The pizza was perfectly cooked with fresh ingredients. Delivery was fast too!',
      imageUrls: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'],
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Michael Chen',
      userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      restaurantId: selectedRestaurant.id,
      orderId: 'order2',
      rating: 4,
      text: 'Great experience overall. The pasta was delicious, though it could use a bit more seasoning. Will definitely order again!',
      imageUrls: [],
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Emily Rodriguez',
      userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      restaurantId: selectedRestaurant.id,
      orderId: 'order3',
      rating: 5,
      text: 'Best Italian food in the city! The bruschetta was fresh and flavorful. Highly recommend!',
      imageUrls: ['https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400'],
      createdAt: new Date('2024-01-08'),
    },
  ];
  
  const galleryImages = [
    selectedRestaurant.imageUrl,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.card, opacity: headerOpacity },
        ]}
      >
        <Pressable
          style={[styles.headerButton, { backgroundColor: colors.background }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {selectedRestaurant.name}
        </Text>
        <Pressable
          style={[styles.headerButton, { backgroundColor: colors.background }]}
          onPress={handleFavorite}
        >
          <Ionicons
            name={selectedRestaurant.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={selectedRestaurant.isFavorite ? colors.error : colors.text}
          />
        </Pressable>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
          <Pressable onPress={() => setShowGallery(true)}>
            <Image source={{ uri: selectedRestaurant.imageUrl }} style={styles.image} contentFit="cover" />
          </Pressable>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageOverlay}>
            <View style={styles.imageBadges}>
              <Badge label={selectedRestaurant.priceRange} variant="default" size="md" />
              <Badge
                label={selectedRestaurant.isOpen ? 'Open' : 'Closed'}
                variant={selectedRestaurant.isOpen ? 'success' : 'error'}
                size="md"
              />
            </View>
          </View>
        </Animated.View>
        
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>
                {selectedRestaurant.name}
              </Text>
              <Pressable onPress={handleFavorite}>
                <Ionicons
                  name={selectedRestaurant.isFavorite ? 'heart' : 'heart-outline'}
                  size={28}
                  color={selectedRestaurant.isFavorite ? colors.error : colors.textMuted}
                />
              </Pressable>
            </View>
            <Text style={[styles.cuisine, { color: colors.textSecondary }]}>
              {selectedRestaurant.cuisine.join(' • ')}
            </Text>
          </View>
          
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {selectedRestaurant.rating}
              </Text>
              <Text style={[styles.metaSubtext, { color: colors.textMuted }]}>
                ({selectedRestaurant.reviewCount} reviews)
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {selectedRestaurant.deliveryTime}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                ${selectedRestaurant.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {selectedRestaurant.address}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                (555) 123-4567
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                Visit Website
              </Text>
            </View>
          </Card>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Operating Hours
            </Text>
            <Card style={styles.hoursCard}>
              {operatingHours.map((item, index) => (
                <View
                  key={item.day}
                  style={[
                    styles.hourRow,
                    index !== operatingHours.length - 1 && styles.hourRowBorder,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.dayText, { color: colors.text }]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
                    {item.hours}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContent}
            >
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && {
                      backgroundColor: colors.primary,
                    },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(category);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category
                        ? { color: '#ffffff' }
                        : { color: colors.text },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          
          {selectedRestaurant.menu.map((category) => (
            <View key={category.id} style={styles.menuCategory}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category.name}
              </Text>
              {category.items.map((item) => (
                <Card key={item.id} style={styles.menuItemCard}>
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemInfo}>
                      <Text style={[styles.menuItemName, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.menuItemDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                      <View style={styles.menuItemMeta}>
                        <Text style={[styles.menuItemPrice, { color: colors.primary }]}>
                          ${item.price.toFixed(2)}
                        </Text>
                        {item.calories && (
                          <Text style={[styles.menuItemCalories, { color: colors.textMuted }]}>
                            {item.calories} cal
                          </Text>
                        )}
                      </View>
                      <View style={styles.menuItemBadges}>
                        {item.isVegetarian && (
                          <Badge label="Vegetarian" variant="success" size="sm" />
                        )}
                        {item.isVegan && (
                          <Badge label="Vegan" variant="success" size="sm" />
                        )}
                        {item.isGlutenFree && (
                          <Badge label="Gluten-Free" variant="info" size="sm" />
                        )}
                      </View>
                    </View>
                    <View style={styles.menuItemImageContainer}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.menuItemImage}
                        contentFit="cover"
                      />
                      <Pressable
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Ionicons name="add" size={20} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ))}
          
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Reviews ({selectedRestaurant.reviewCount})
              </Text>
              <Pressable>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </Pressable>
            </View>
            <RatingBreakdown
              rating={selectedRestaurant.rating}
              reviewCount={selectedRestaurant.reviewCount}
            />
            <View style={styles.reviewsList}>
              {mockReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
      
      <Modal
        visible={showGallery}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={styles.galleryModal}>
          <Pressable
            style={styles.galleryClose}
            onPress={() => setShowGallery(false)}
          >
            <Ionicons name="close" size={32} color="#ffffff" />
          </Pressable>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
          >
            {galleryImages.map((uri, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image
                  source={{ uri }}
                  style={styles.galleryImage}
                  contentFit="contain"
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.galleryIndicator}>
            <Text style={styles.galleryIndicatorText}>
              {selectedImage + 1} / {galleryImages.length}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  imageBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  cuisine: {
    fontSize: 16,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaSubtext: {
    fontSize: 14,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 12,
  },
  infoCard: {
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  hoursCard: {
    padding: 0,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  hourRowBorder: {
    borderBottomWidth: 1,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 15,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContent: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  menuItemCard: {
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuItemCalories: {
    fontSize: 13,
  },
  menuItemBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  menuItemImageContainer: {
    position: 'relative',
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 12,
    marginTop: 16,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  galleryClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImageContainer: {
    width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  galleryIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});