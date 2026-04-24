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
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[styles.compactContainer, { 
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
          }]}
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
              <Ionicons name="star" size={12} color="#ffa726" />
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
        style={[styles.container, { 
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        }]}
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
              size={22}
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
              <Ionicons name="star" size={16} color="#ffa726" />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.metaSubtext, { color: colors.textMuted }]}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {restaurant.deliveryTime}
              </Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={16} color={colors.textSecondary} />
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
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 180,
    width: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badges: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  cuisine: {
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metaSubtext: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  compactContainer: {
    width: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactImage: {
    height: 110,
    width: '100%',
  },
  compactContent: {
    padding: 12,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  compactRating: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});