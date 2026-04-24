import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'gradient';
  gradientColors?: string[];
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  gradientColors,
  padding = 'md',
}: CardProps) {
  const { colors, isDark, gradients } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: 12 };
      case 'md':
        return { padding: 16 };
      case 'lg':
        return { padding: 24 };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.cardElevated,
          shadowColor: colors.shadowStrong,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 12,
        };
      case 'gradient':
        return {
          overflow: 'hidden',
        };
      default:
        return {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 6,
        };
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...getVariantStyle(),
    ...getPaddingStyle(),
    ...style,
  };

  const content = variant === 'gradient' ? (
    <LinearGradient
      colors={gradientColors || (isDark ? gradients.cardDark : gradients.card) as [string, string]}
      style={[styles.gradient, getPaddingStyle()]}
    >
      {children}
    </LinearGradient>
  ) : (
    children
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={containerStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
  },
});