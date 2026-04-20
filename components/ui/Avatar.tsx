import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
  style?: ViewStyle;
}

export function Avatar({
  source,
  name = '',
  size = 'md',
  showStatus = false,
  status = 'online',
  style,
}: AvatarProps) {
  const { colors } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'xs':
        return 28;
      case 'sm':
        return 36;
      case 'md':
        return 48;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return 10;
      case 'sm':
        return 12;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      case 'xl':
        return 36;
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 8;
      case 'sm':
        return 10;
      case 'md':
        return 12;
      case 'lg':
        return 14;
      case 'xl':
        return 18;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'offline':
        return colors.textMuted;
      case 'busy':
        return colors.error;
    }
  };

  const getInitials = () => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const dimension = getSize();
  const fontSize = getFontSize();
  const statusSize = getStatusSize();

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: '#ffffff' }]}>
            {getInitials()}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(),
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});