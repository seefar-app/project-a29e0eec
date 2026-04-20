import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type TextVariant = 'default' | 'secondary' | 'muted' | 'title' | 'subtitle' | 'caption';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
}

export function ThemedText({
  style,
  variant = 'default',
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return { ...styles.title, color: colors.text };
      case 'subtitle':
        return { ...styles.subtitle, color: colors.text };
      case 'secondary':
        return { ...styles.default, color: colors.textSecondary };
      case 'muted':
        return { ...styles.caption, color: colors.textMuted };
      case 'caption':
        return { ...styles.caption, color: colors.textSecondary };
      default:
        return { ...styles.default, color: colors.text };
    }
  };

  return <Text style={[getVariantStyle(), style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
  },
});