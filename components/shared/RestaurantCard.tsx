import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Restaurant } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'compact';
}

export function RestaurantCard({ restaurant, variant = 'default' }: RestaurantCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(restaurant.id);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[styles.compactContainer, { backgroundColor: colors.card }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Image source={{ uri: restaurant.imageUrl }} style={styles.compactImage} contentFit="cover" />
          <View style={styles.compactContent}>
            <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={styles.compactMeta}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={[styles.compactRating, { color: colors.textSecondary }]}>
                {restaurant.rating}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.imageUrl }} style={styles.image} contentFit="cover" />
          <Pressable
            style={[styles.favoriteButton, { backgroundColor: colors.background }]}
            onPress={handleFavorite}
          >
            <Ionicons
              name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={restaurant.isFavorite ? colors.error : colors.textMuted}
            />
          </Pressable>
          {!restaurant.isOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
          <View style={styles.badges}>
            <Badge label={restaurant.priceRange} variant="default" size="sm" />
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {restaurant.name}
            </Text>
          </View>
          <Text style={[styles.cuisine, { color: colors.textSecondary }]} numberOfLines={1}>
            {restaurant.cuisine.join(' • ')}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.metaSubtext, { color: colors.textMuted }]}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {restaurant.deliveryTime}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                ${restaurant.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 160,
    width: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  badges: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cuisine: {
    fontSize: 13,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaSubtext: {
    fontSize: 12,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 10,
  },
  compactContainer: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  compactImage: {
    height: 100,
    width: '100%',
  },
  compactContent: {
    padding: 10,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  compactRating: {
    fontSize: 12,
  },
});