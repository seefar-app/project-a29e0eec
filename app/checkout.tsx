import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AddressSelector } from '@/components/shared/AddressSelector';
import { PaymentMethodSelector } from '@/components/shared/PaymentMethodSelector';
import { Address, PaymentMethod } from '@/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
  const {
    cart,
    cartRestaurantId,
    restaurants,
    getCartTotal,
    appliedPromo,
    removePromoCode,
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
    placeOrder,
  } = useStore();

  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

  const restaurant = restaurants.find(r => r.id === cartRestaurantId);
  const totals = getCartTotal();

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      router.replace('/(tabs)');
    }
  }, [cart, orderPlaced]);

  useEffect(() => {
    if (user?.savedAddresses.length && !selectedDeliveryAddress) {
      const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
      setSelectedDeliveryAddress(defaultAddr);
    }
  }, [user]);

  useEffect(() => {
    if (user?.paymentMethods.length && !selectedPaymentMethod) {
      const defaultMethod = user.paymentMethods.find(m => m.isDefault) || user.paymentMethods[0];
      setSelectedPaymentMethod(defaultMethod);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!selectedDeliveryAddress || !selectedPaymentMethod) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsPlacingOrder(true);

    try {
      const order = await placeOrder(selectedDeliveryAddress, selectedPaymentMethod);
      setPlacedOrderId(order.id);
      setOrderPlaced(true);
      
      setTimeout(() => {
        router.replace(`/order/${order.id}`);
      }, 2000);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsPlacingOrder(false);
    }
  };

  if (!restaurant || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orderPlaced) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Order Placed!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your order has been confirmed
          </Text>
          <Text style={[styles.orderId, { color: colors.textMuted }]}>
            Order ID: {placedOrderId}
          </Text>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
          <Text style={[styles.redirectText, { color: colors.textSecondary }]}>
            Redirecting to order tracking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          </View>
          {selectedDeliveryAddress ? (
            <Pressable
              style={styles.selectedItem}
              onPress={() => setShowAddressSelector(true)}
            >
              <View style={styles.selectedItemInfo}>
                <Text style={[styles.selectedItemLabel, { color: colors.text }]}>
                  {selectedDeliveryAddress.label}
                </Text>
                <Text style={[styles.selectedItemText, { color: colors.textSecondary }]}>
                  {selectedDeliveryAddress.street}, {selectedDeliveryAddress.city}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ) : (
            <Button
              title="Select Address"
              onPress={() => setShowAddressSelector(true)}
              variant="outline"
            />
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>
          {selectedPaymentMethod ? (
            <Pressable
              style={styles.selectedItem}
              onPress={() => setShowPaymentSelector(true)}
            >
              <View style={styles.selectedItemInfo}>
                <Text style={[styles.selectedItemLabel, { color: colors.text }]}>
                  {selectedPaymentMethod.type === 'card'
                    ? `${selectedPaymentMethod.cardBrand} •••• ${selectedPaymentMethod.cardLast4}`
                    : selectedPaymentMethod.type === 'wallet'
                    ? 'Wallet'
                    : 'Cash on Delivery'}
                </Text>
                {selectedPaymentMethod.type === 'card' && (
                  <Text style={[styles.selectedItemText, { color: colors.textSecondary }]}>
                    Expires {selectedPaymentMethod.cardExpiry}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ) : (
            <Button
              title="Select Payment Method"
              onPress={() => setShowPaymentSelector(true)}
              variant="outline"
            />
          )}
        </Card>

        {appliedPromo && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={24} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Code</Text>
            </View>
            <View style={styles.promoApplied}>
              <View style={styles.promoInfo}>
                <Text style={[styles.promoCode, { color: colors.success }]}>
                  {appliedPromo.code}
                </Text>
                <Badge label={`-$${totals.discount.toFixed(2)}`} variant="success" size="sm" />
              </View>
              <Pressable onPress={removePromoCode}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </Pressable>
            </View>
          </Card>
        )}

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          </View>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: restaurant.imageUrl }} style={styles.restaurantImage} />
            <View style={styles.restaurantDetails}>
              <Text style={[styles.restaurantName, { color: colors.text }]}>
                {restaurant.name}
              </Text>
              <Text style={[styles.restaurantMeta, { color: colors.textSecondary }]}>
                {restaurant.deliveryTime} • ${restaurant.deliveryFee.toFixed(2)} delivery
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {cart.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={[styles.orderItemQuantity, { color: colors.textSecondary }]}>
                {item.quantity}x
              </Text>
              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemName, { color: colors.text }]}>
                  {item.menuItem.name}
                </Text>
                {item.customizations.length > 0 && (
                  <Text style={[styles.orderItemCustomizations, { color: colors.textMuted }]}>
                    {item.customizations.map(c => c.optionName).join(', ')}
                  </Text>
                )}
              </View>
              <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${totals.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${totals.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Tax</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${totals.tax.toFixed(2)}
            </Text>
          </View>
          {totals.discount > 0 && (
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.costValue, { color: colors.success }]}>
                -${totals.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${totals.total.toFixed(2)}
            </Text>
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <Button
          title={isPlacingOrder ? 'Placing Order...' : `Place Order • $${totals.total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={!selectedDeliveryAddress || !selectedPaymentMethod || isPlacingOrder}
          loading={isPlacingOrder}
          fullWidth
        />
      </View>

      <AddressSelector
        visible={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        addresses={user.savedAddresses}
        selectedAddress={selectedDeliveryAddress}
        onSelectAddress={setSelectedDeliveryAddress}
        onAddNew={() => {
          setShowAddressSelector(false);
        }}
      />

      <PaymentMethodSelector
        visible={showPaymentSelector}
        onClose={() => setShowPaymentSelector(false)}
        paymentMethods={user.paymentMethods}
        selectedMethod={selectedPaymentMethod}
        onSelectMethod={setSelectedPaymentMethod}
        onAddNew={() => {
          setShowPaymentSelector(false);
        }}
        walletBalance={user.walletBalance}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  orderId: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  redirectText: {
    fontSize: 14,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedItemText: {
    fontSize: 14,
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: '700',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  restaurantImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  restaurantMeta: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderItemCustomizations: {
    fontSize: 12,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 15,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});