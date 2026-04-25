import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { OrderStatus } from '@/types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  order_placed: { label: 'Order Placed', color: '#3b82f6', icon: 'receipt' },
  restaurant_confirmed: { label: 'Confirmed', color: '#8b5cf6', icon: 'checkmark-circle' },
  preparing: { label: 'Preparing', color: '#f59e0b', icon: 'restaurant' },
  ready_for_pickup: { label: 'Ready', color: '#10b981', icon: 'cube' },
  out_for_delivery: { label: 'On the Way', color: '#f97316', icon: 'bicycle' },
  delivered: { label: 'Delivered', color: '#22c55e', icon: 'checkmark-done' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
  order_failed: { label: 'Failed', color: '#dc2626', icon: 'alert-circle' },
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { orders, setActiveOrder } = useStore();
  
  const [mapReady, setMapReady] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  const order = orders.find(o => o.id === id);

  useEffect(() => {
    if (order) {
      setActiveOrder(order.id);
    }
  }, [order?.id]);

  useEffect(() => {
    // Pulse animation for active status
    if (order && !['delivered', 'cancelled', 'order_failed'].includes(order.status)) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [order?.status]);

  useEffect(() => {
    // Fit map to show both restaurant and delivery location
    if (mapReady && order && mapRef.current) {
      const coordinates = [
        {
          latitude: order.restaurant.coordinates.latitude,
          longitude: order.restaurant.coordinates.longitude,
        },
        {
          latitude: order.deliveryAddress.latitude,
          longitude: order.deliveryAddress.longitude,
        },
      ];

      if (order.deliveryPartner) {
        coordinates.push({
          latitude: order.deliveryPartner.currentLocation.latitude,
          longitude: order.deliveryPartner.currentLocation.longitude,
        });
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [mapReady, order?.deliveryPartner]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Order not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.errorLink, { color: colors.primary }]}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = statusConfig[order.status];
  const isActive = !['delivered', 'cancelled', 'order_failed'].includes(order.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Tracking</Text>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : 1 }] }}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: currentStatus.color + '20' },
                ]}
              >
                <Ionicons name={currentStatus.icon as any} size={32} color={currentStatus.color} />
              </View>
            </Animated.View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {currentStatus.label}
              </Text>
              <Text style={[styles.statusTime, { color: colors.textSecondary }]}>
                {order.status === 'delivered' && order.actualDeliveryTime
                  ? `Delivered at ${format(order.actualDeliveryTime, 'h:mm a')}`
                  : `Estimated delivery: ${format(order.estimatedDeliveryTime, 'h:mm a')}`}
              </Text>
            </View>
            {isActive && <StatusIndicator />}
          </View>
        </Card>

        {order.deliveryPartner && order.status === 'out_for_delivery' && (
          <Card style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <Avatar source={{ uri: order.deliveryPartner.avatar }} size={56} />
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: colors.text }]}>
                  {order.deliveryPartner.name}
                </Text>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={[styles.driverRating, { color: colors.textSecondary }]}>
                    {order.deliveryPartner.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.driverVehicle, { color: colors.textMuted }]}>
                    • {order.deliveryPartner.vehicleType} • {order.deliveryPartner.vehiclePlate}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.callButton, { backgroundColor: colors.primary }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Ionicons name="call" size={20} color="#ffffff" />
              </Pressable>
            </View>
          </Card>
        )}

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: order.restaurant.coordinates.latitude,
              longitude: order.restaurant.coordinates.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onMapReady={() => setMapReady(true)}
          >
            <Marker
              coordinate={{
                latitude: order.restaurant.coordinates.latitude,
                longitude: order.restaurant.coordinates.longitude,
              }}
              title={order.restaurant.name}
            >
              <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="restaurant" size={20} color="#ffffff" />
              </View>
            </Marker>

            <Marker
              coordinate={{
                latitude: order.deliveryAddress.latitude,
                longitude: order.deliveryAddress.longitude,
              }}
              title="Delivery Address"
            >
              <View style={[styles.markerContainer, { backgroundColor: colors.success }]}>
                <Ionicons name="home" size={20} color="#ffffff" />
              </View>
            </Marker>

            {order.deliveryPartner && (
              <Marker
                coordinate={{
                  latitude: order.deliveryPartner.currentLocation.latitude,
                  longitude: order.deliveryPartner.currentLocation.longitude,
                }}
                title="Delivery Partner"
              >
                <View style={[styles.markerContainer, { backgroundColor: colors.accent }]}>
                  <Ionicons name="bicycle" size={20} color="#ffffff" />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <Card style={styles.timelineCard}>
          <Text style={[styles.timelineTitle, { color: colors.text }]}>Order Status</Text>
          <View style={styles.timeline}>
            {order.statusHistory.map((item, index) => {
              const isLast = index === order.statusHistory.length - 1;
              const statusInfo = statusConfig[item.status];
              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isLast ? statusInfo.color : colors.border,
                        },
                      ]}
                    />
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineStatus, { color: colors.text }]}>
                      {item.message}
                    </Text>
                    <Text style={[styles.timelineTime, { color: colors.textSecondary }]}>
                      {format(item.timestamp, 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={[styles.orderTitle, { color: colors.text }]}>Order Details</Text>
            <Badge label={`#${order.id.slice(0, 8)}`} variant="default" size="sm" />
          </View>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: order.restaurant.imageUrl }} style={styles.restaurantImage} />
            <View style={styles.restaurantDetails}>
              <Text style={[styles.restaurantName, { color: colors.text }]}>
                {order.restaurant.name}
              </Text>
              <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
                {order.restaurant.address}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
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
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${order.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Tax</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>
              ${order.tax.toFixed(2)}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.costValue, { color: colors.success }]}>
                -${order.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.costRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${order.totalPrice.toFixed(2)}
            </Text>
          </View>
        </Card>

        <Card style={styles.addressCard}>
          <Text style={[styles.addressTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={styles.addressInfo}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.addressDetails}>
              <Text style={[styles.addressLabel, { color: colors.text }]}>
                {order.deliveryAddress.label}
              </Text>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                {order.deliveryAddress.street}
              </Text>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
  },
  driverCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRating: {
    fontSize: 13,
    fontWeight: '600',
  },
  driverVehicle: {
    fontSize: 12,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  timelineCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingTop: -2,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
  },
  orderCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
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
  restaurantAddress: {
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
  addressCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  addressInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
});