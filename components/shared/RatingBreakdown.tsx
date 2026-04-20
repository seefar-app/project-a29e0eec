import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';

interface RatingBreakdownProps {
  rating: number;
  reviewCount: number;
}

export function RatingBreakdown({ rating, reviewCount }: RatingBreakdownProps) {
  const { colors } = useTheme();
  
  // Mock rating distribution
  const distribution = [
    { stars: 5, count: Math.floor(reviewCount * 0.65), percentage: 65 },
    { stars: 4, count: Math.floor(reviewCount * 0.20), percentage: 20 },
    { stars: 3, count: Math.floor(reviewCount * 0.10), percentage: 10 },
    { stars: 2, count: Math.floor(reviewCount * 0.03), percentage: 3 },
    { stars: 1, count: Math.floor(reviewCount * 0.02), percentage: 2 },
  ];
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.ratingSection}>
          <Text style={[styles.ratingValue, { color: colors.text }]}>
            {rating.toFixed(1)}
          </Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(rating) ? 'star' : 'star-outline'}
                size={20}
                color="#fbbf24"
              />
            ))}
          </View>
          <Text style={[styles.reviewCount, { color: colors.textMuted }]}>
            Based on {reviewCount} reviews
          </Text>
        </View>
      </View>
      
      <View style={styles.distribution}>
        {distribution.map((item) => (
          <View key={item.stars} style={styles.distributionRow}>
            <Text style={[styles.starLabel, { color: colors.text }]}>
              {item.stars}
            </Text>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <View style={[styles.barContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  styles.bar,
                  { width: `${item.percentage}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.countLabel, { color: colors.textMuted }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
  },
  distribution: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 12,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 13,
    width: 40,
    textAlign: 'right',
  },
});