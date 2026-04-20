import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Address } from '@/types';

interface LocationInputProps {
  address?: Address;
  placeholder?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function LocationInput({
  address,
  placeholder = 'Select delivery address',
  onPress,
  style,
}: LocationInputProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="location" size={20} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        {address ? (
          <>
            <Text style={[styles.label, { color: colors.textMuted }]}>{address.label}</Text>
            <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
              {address.street}
            </Text>
          </>
        ) : (
          <Text style={[styles.placeholder, { color: colors.textMuted }]}>
            {placeholder}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 14,
  },
});