import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StatusIndicatorProps {
  status: 'live' | 'active' | 'pending' | 'inactive';
  size?: number;
  style?: ViewStyle;
}

export function StatusIndicator({
  status,
  size = 10,
  style,
}: StatusIndicatorProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'live' || status === 'active') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [status]);

  const getColor = () => {
    switch (status) {
      case 'live':
        return colors.error;
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'inactive':
        return colors.textMuted;
    }
  };

  const color = getColor();

  return (
    <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }, style]}>
      {(status === 'live' || status === 'active') && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: size * 2,
              height: size * 2,
              borderRadius: size,
              backgroundColor: color,
              opacity: 0.3,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {},
});