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
import { PaymentMethod } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PaymentMethodSelectorProps {
  visible: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  onAddNew: () => void;
  walletBalance?: number;
}

export function PaymentMethodSelector({
  visible,
  onClose,
  paymentMethods,
  selectedMethod,
  onSelectMethod,
  onAddNew,
  walletBalance = 0,
}: PaymentMethodSelectorProps) {
  const { colors } = useTheme();

  const handleSelectMethod = (method: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectMethod(method);
    onClose();
  };

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Payment Method</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {paymentMethods.map(method => {
            const isSelected = selectedMethod?.id === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => handleSelectMethod(method)}
              >
                <Card
                  style={[
                    styles.methodCard,
                    isSelected && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.methodContent}>
                    <View style={styles.methodIcon}>
                      <Ionicons
                        name={
                          method.type === 'card'
                            ? getCardIcon(method.cardBrand)
                            : method.type === 'wallet'
                            ? 'wallet'
                            : 'cash'
                        }
                        size={24}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <View style={styles.methodInfo}>
                      {method.type === 'card' && (
                        <>
                          <Text style={[styles.methodLabel, { color: colors.text }]}>
                            {method.cardBrand} •••• {method.cardLast4}
                          </Text>
                          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>
                            Expires {method.cardExpiry}
                          </Text>
                        </>
                      )}
                      {method.type === 'wallet' && (
                        <>
                          <Text style={[styles.methodLabel, { color: colors.text }]}>
                            Wallet
                          </Text>
                          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>
                            Balance: ${walletBalance.toFixed(2)}
                          </Text>
                        </>
                      )}
                      {method.type === 'cash' && (
                        <>
                          <Text style={[styles.methodLabel, { color: colors.text }]}>
                            Cash on Delivery
                          </Text>
                          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>
                            Pay when you receive
                          </Text>
                        </>
                      )}
                    </View>
                    <View style={styles.methodActions}>
                      {method.isDefault && <Badge label="Default" variant="default" size="sm" />}
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}

          <Pressable onPress={onAddNew}>
            <Card style={[styles.addNewCard, { borderColor: colors.primary, borderStyle: 'dashed' }]}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={[styles.addNewText, { color: colors.primary }]}>
                Add Payment Method
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
  methodCard: {
    marginBottom: 12,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodSubtext: {
    fontSize: 13,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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