import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondary,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.primary,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: colors.error,
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          },
          text: {
            color: '#ffffff',
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 10, paddingHorizontal: 18, height: 40 },
          text: { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
          iconSize: 16,
        };
      case 'md':
        return {
          container: { paddingVertical: 14, paddingHorizontal: 24, height: 50 },
          text: { fontSize: 16, fontWeight: '600', letterSpacing: 0.4 },
          iconSize: 20,
        };
      case 'lg':
        return {
          container: { paddingVertical: 18, paddingHorizontal: 32, height: 58 },
          text: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
          iconSize: 24,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...variantStyles.container,
    ...sizeStyles.container,
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const textStyles: TextStyle = {
    ...styles.text,
    ...variantStyles.text,
    ...sizeStyles.text,
    ...textStyle,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={variantStyles.text.color} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={sizeStyles.iconSize}
                color={variantStyles.text.color as string}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={textStyles}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={sizeStyles.iconSize}
                color={variantStyles.text.color as string}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});