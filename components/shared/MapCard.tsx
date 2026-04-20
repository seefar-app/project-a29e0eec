import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface MapCardProps {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
  showPin?: boolean;
}

export function MapCard({
  latitude,
  longitude,
  style,
  showPin = true,
}: MapCardProps) {
  const { colors } = useTheme();

  // Using a static map image from Unsplash as placeholder
  const mapImage = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }, style]}>
      <Image
        source={{ uri: mapImage }}
        style={styles.map}
        contentFit="cover"
      />
      {showPin && (
        <View style={styles.pinContainer}>
          <Ionicons name="location" size={32} color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
});