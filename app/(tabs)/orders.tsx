import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { OrderCard } from '@/components/shared/OrderCard';
import { Skeleton } from '@/components/ui/Skeleton';

type OrderTab = 'active' | 'past';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { orders, isLoadingOrders, fetchOrders } = useStore();

  const [activeTab, setActiveTab] = useState<OrderTab>('active');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOrders();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: activeTab === 'active' ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const activeOrders = orders.filter(o => 
    !['delivered', 'cancelled', 'order_failed'].includes(o.status)
  );
  const pastOrders = orders.filter(o => 
    ['delivered', 'cancelled', 'order_failed'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const translateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        
        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: colors.primary, transform: [{ translateX }] },
            ]}
          />
          <Pressable style={styles.tab} onPress={() => setActiveTab('active')}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'active' ? '#ffffff' : colors.textSecondary },
              ]}
            >
              Active ({activeOrders.length})
            </Text>
          </Pressable>
          <Pressable style={styles.tab} onPress={() => setActiveTab('past')}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'past' ? '#ffffff' : colors.textSecondary },
              ]}
            >
              Past ({pastOrders.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isLoadingOrders ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
                <View style={styles.skeletonHeader}>
                  <Skeleton width={48} height={48} borderRadius={10} />
                  <View style={styles.skeletonHeaderText}>
                    <Skeleton width="60%" height={18} />
                    <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
                  </View>
                </View>
                <Skeleton width="100%" height={1} style={{ marginVertical: 12 }} />
                <Skeleton width="80%" height={14} />
                <View style={styles.skeletonFooter}>
                  <Skeleton width={60} height={20} />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
            ))}
          </View>
        ) : displayedOrders.length === 0 ? (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons
                name={activeTab === 'active' ? 'receipt-outline' : 'time-outline'}
                size={48}
                color={colors.textMuted}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'active' ? 'No Active Orders' : 'No Past Orders'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeTab === 'active'
                ? "You don't have any ongoing orders. Start exploring restaurants!"
                : "You haven't completed any orders yet."}
            </Text>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {displayedOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: 150,
    height: '100%',
    borderRadius: 10,
    left: 4,
    top: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {},
  skeletonCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});