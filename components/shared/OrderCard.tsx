import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/shared/StatusIndicator';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/order/${order.id}`);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const getStatusInfo = (status: OrderStatus): { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'primary'; indicatorStatus: 'live' | 'active' | 'pending' | 'inactive' } => {
    switch (status) {
      case 'order_placed':
        return { label: 'Order Placed', variant: 'info', indicatorStatus: 'pending' };
      case 'restaurant_confirmed':
        return { label: 'Confirmed', variant: 'info', indicatorStatus: 'active' };
      case 'preparing':
        return { label: 'Preparing', variant: 'warning', indicatorStatus: 'active' };
      case 'ready_for_pickup':
        return { label: 'Ready', variant: 'primary', indicatorStatus: 'active' };
      case 'out_for_delivery':
        return { label: 'On the way', variant: 'primary', indicatorStatus: 'live' };
      case 'delivered':
        return { label: 'Delivered', variant: 'success', indicatorStatus: 'inactive' };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'error', indicatorStatus: 'inactive' };
      case 'order_failed':
        return { label: 'Failed', variant: 'error', indicatorStatus: 'inactive' };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const isActive = !['delivered', 'cancelled', 'order_failed'].includes(order.status);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: order.restaurant.imageUrl }}
            style={styles.restaurantImage}
            contentFit="cover"
          />
          <View style={styles.headerContent}>
            <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
              {order.restaurant.name}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {isActive && <StatusIndicator status={statusInfo.indicatorStatus} size={8} />}
            <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.content}>
          <Text style={[styles.items, { color: colors.textSecondary }]} numberOfLines={1}>
            {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.total, { color: colors.text }]}>
              ${order.totalPrice.toFixed(2)}
            </Text>
            <Text style={[styles.itemCount, { color: colors.textMuted }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={[styles.trackingBanner, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.trackingText, { color: colors.primary }]}>
              Track your order
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  content: {
    padding: 14,
  },
  items: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemCount: {
    fontSize: 13,
  },
  trackingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});