import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const { height } = Dimensions.get('window');

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    cart,
    cartRestaurantId,
    restaurants,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const restaurant = restaurants.find(r => r.id === cartRestaurantId);
  const totals = getCartTotal();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateCartItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFromCart(itemId);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setApplyingPromo(true);
    setPromoError('');
    
    const success = await applyPromoCode(promoInput.trim());
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPromoInput('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPromoError('Invalid promo code');
    }
    
    setApplyingPromo(false);
  };

  const handleRemovePromo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removePromoCode();
    setPromoError('');
  };

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/checkout');
  };

  const meetsMinimumOrder = restaurant ? totals.subtotal >= restaurant.minOrder : true;

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
          <Text style={[styles.title, { color: colors.text }]}>Your Cart</Text>
          {cart.length > 0 && (
            <Pressable onPress={clearCart}>
              <Text style={[styles.clearText, { color: colors.error }]}>Clear</Text>
            </Pressable>
          )}
          {cart.length === 0 && <View style={{ width: 28 }} />}
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add items from a restaurant to get started
            </Text>
            <Button title="Browse Restaurants" onPress={onClose} style={{ marginTop: 24 }} />
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {restaurant && (
                <View style={[styles.restaurantInfo, { backgroundColor: colors.card }]}>
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
              )}

              <View style={styles.items}>
                {cart.map(item => (
                  <View key={item.id} style={[styles.item, { borderBottomColor: colors.border }]}>
                    <Image source={{ uri: item.menuItem.imageUrl }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.text }]}>
                        {item.menuItem.name}
                      </Text>
                      {item.customizations.length > 0 && (
                        <Text style={[styles.itemCustomizations, { color: colors.textSecondary }]}>
                          {item.customizations.map(c => c.optionName).join(', ')}
                        </Text>
                      )}
                      {item.specialInstructions && (
                        <Text style={[styles.itemInstructions, { color: colors.textMuted }]}>
                          Note: {item.specialInstructions}
                        </Text>
                      )}
                      <Text style={[styles.itemPrice, { color: colors.primary }]}>
                        ${item.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      <Pressable onPress={() => handleRemoveItem(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </Pressable>
                      <View style={styles.quantityControls}>
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </Pressable>
                        <Text style={[styles.quantityText, { color: colors.text }]}>
                          {item.quantity}
                        </Text>
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.promoSection}>
                <Text style={[styles.promoLabel, { color: colors.text }]}>Promo Code</Text>
                {appliedPromo ? (
                  <View style={[styles.appliedPromo, { backgroundColor: colors.success + '20' }]}>
                    <View style={styles.appliedPromoInfo}>
                      <Ionicons name="pricetag" size={20} color={colors.success} />
                      <Text style={[styles.appliedPromoCode, { color: colors.success }]}>
                        {appliedPromo.code}
                      </Text>
                      <Badge
                        label={`-$${totals.discount.toFixed(2)}`}
                        variant="success"
                        size="sm"
                      />
                    </View>
                    <Pressable onPress={handleRemovePromo}>
                      <Ionicons name="close-circle" size={24} color={colors.success} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.promoInput}>
                    <Input
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChangeText={(text) => {
                        setPromoInput(text);
                        setPromoError('');
                      }}
                      style={{ flex: 1 }}
                      error={promoError}
                    />
                    <Button
                      title="Apply"
                      onPress={handleApplyPromo}
                      loading={applyingPromo}
                      disabled={!promoInput.trim()}
                      size="sm"
                    />
                  </View>
                )}
              </View>

              <View style={[styles.summary, { backgroundColor: colors.card }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${totals.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Delivery Fee
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${totals.deliveryFee.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Tax
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${totals.tax.toFixed(2)}
                  </Text>
                </View>
                {totals.discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>
                      Discount
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -${totals.discount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryTotal, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.summaryTotal, { color: colors.primary }]}>
                    ${totals.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {restaurant && !meetsMinimumOrder && (
                <View style={[styles.minimumWarning, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="information-circle" size={20} color={colors.warning} />
                  <Text style={[styles.minimumWarningText, { color: colors.warning }]}>
                    Minimum order: ${restaurant.minOrder.toFixed(2)} (${(restaurant.minOrder - totals.subtotal).toFixed(2)} more needed)
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
              <Button
                title={`Checkout • $${totals.total.toFixed(2)}`}
                onPress={handleCheckout}
                disabled={!meetsMinimumOrder}
                fullWidth
              />
            </View>
          </>
        )}
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
  clearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
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
  items: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCustomizations: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemInstructions: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  promoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  promoLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  promoInput: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appliedPromoCode: {
    fontSize: 15,
    fontWeight: '700',
  },
  summary: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  minimumWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  minimumWarningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
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