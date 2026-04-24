import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Address } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AddressSelectorProps {
  visible: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onAddNew: () => void;
}

export function AddressSelector({
  visible,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNew,
}: AddressSelectorProps) {
  const { colors } = useTheme();

  const handleSelectAddress = (address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectAddress(address);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Delivery Address</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {addresses.map(address => {
            const isSelected = selectedAddress?.id === address.id;
            return (
              <Pressable
                key={address.id}
                onPress={() => handleSelectAddress(address)}
              >
                <Card
                  style={[
                    styles.addressCard,
                    isSelected && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelContainer}>
                      <Ionicons
                        name={
                          address.label === 'Home'
                            ? 'home'
                            : address.label === 'Work'
                            ? 'briefcase'
                            : 'location'
                        }
                        size={20}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.addressLabel, { color: colors.text }]}>
                        {address.label}
                      </Text>
                    </View>
                    {address.isDefault && <Badge label="Default" variant="default" size="sm" />}
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </View>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.street}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.city}, {address.zipCode}
                  </Text>
                </Card>
              </Pressable>
            );
          })}

          <Pressable onPress={onAddNew}>
            <Card style={[styles.addNewCard, { borderColor: colors.primary, borderStyle: 'dashed' }]}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={[styles.addNewText, { color: colors.primary }]}>
                Add New Address
              </Text>
            </Card>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addressCard: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderWidth: 2,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
  },
});