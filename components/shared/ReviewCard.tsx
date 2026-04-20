import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { colors } = useTheme();
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={14}
        color={index < rating ? '#fbbf24' : colors.textMuted}
      />
    ));
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Avatar
          imageUrl={review.userAvatar}
          name={review.userName}
          size={40}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {review.userName}
          </Text>
          <View style={styles.rating}>
            {renderStars(review.rating)}
          </View>
        </View>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {format(review.createdAt, 'MMM d, yyyy')}
        </Text>
      </View>
      
      <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
        {review.text}
      </Text>
      
      {review.imageUrls.length > 0 && (
        <View style={styles.images}>
          {review.imageUrls.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.image}
              contentFit="cover"
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: 13,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  images: {
    flexDirection: 'row',
    gap: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});