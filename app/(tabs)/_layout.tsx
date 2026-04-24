import React, { useMemo, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { CartSheet } from '@/components/shared/CartSheet';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const [cartSheetVisible, setCartSheetVisible] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Use proper Zustand selectors to subscribe to specific state slices
  const cart = useStore(state => state.cart);
  const orders = useStore(state => state.orders);
  
  // Cache derived values with useMemo to prevent infinite loops
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);
  
  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => 
      !['delivered', 'cancelled', 'order_failed'].includes(o.status)
    ).length;
  }, [orders]);

  const handleCartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCartSheetVisible(true);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 10,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              },
              android: {
                elevation: 20,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView 
                intensity={80} 
                tint={isDark ? 'dark' : 'light'} 
                style={StyleSheet.absoluteFill} 
              />
            ) : null
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <View>
                <Ionicons 
                  name={focused ? 'receipt' : 'receipt-outline'} 
                  size={24} 
                  color={color} 
                />
                {activeOrdersCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <View style={styles.badgeDot} />
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>

      {/* Floating Cart Button */}
      <Animated.View 
        style={[
          styles.cartButton,
          { 
            backgroundColor: colors.primary,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable
          onPress={handleCartPress}
          style={styles.cartButtonPressable}
        >
          <Ionicons name="cart" size={24} color="#ffffff" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Cart Sheet Modal */}
      <CartSheet 
        visible={cartSheetVisible} 
        onClose={() => setCartSheetVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  cartButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    zIndex: 1000,
  },
  cartButtonPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});