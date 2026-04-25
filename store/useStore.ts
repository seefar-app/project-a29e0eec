import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  SelectedCustomization,
  PromoCode,
  Address,
  PaymentMethod,
  DeliveryPartner,
  StatusHistoryItem,
} from '@/types';

// React Native compatible unique ID generator
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

interface StoreState {
  // Restaurants
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isLoadingRestaurants: boolean;

  // Cart
  cart: CartItem[];
  cartRestaurantId: string | null;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  isLoadingOrders: boolean;

  // Favorites
  favoriteRestaurantIds: string[];

  // Search & Filters
  searchQuery: string;
  selectedCuisines: string[];
  dietaryFilters: string[];
  sortBy: 'rating' | 'deliveryTime' | 'distance' | 'priceAsc' | 'priceDesc';

  // Promo
  appliedPromo: PromoCode | null;

  // Location
  userLocation: { latitude: number; longitude: number } | null;
  selectedDeliveryAddress: Address | null;

  // Actions
  fetchRestaurants: () => Promise<void>;
  selectRestaurant: (id: string) => void;

  addToCart: (item: MenuItem, quantity: number, customizations: SelectedCustomization[], instructions: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  fetchOrders: () => Promise<void>;
  placeOrder: (deliveryAddress: Address, paymentMethod: PaymentMethod) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (orderId: string) => void;
  rateOrder: (orderId: string, rating: number, review: string) => void;

  toggleFavorite: (restaurantId: string) => void;

  setSearchQuery: (query: string) => void;
  setSelectedCuisines: (cuisines: string[]) => void;
  setDietaryFilters: (filters: string[]) => void;
  setSortBy: (sort: 'rating' | 'deliveryTime' | 'distance' | 'priceAsc' | 'priceDesc') => void;

  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;

  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setSelectedDeliveryAddress: (address: Address) => void;

  getCartTotal: () => { subtotal: number; tax: number; deliveryFee: number; discount: number; total: number };
  getFilteredRestaurants: () => Restaurant[];
}

const mapDatabaseRestaurantToRestaurant = (dbRestaurant: any): Restaurant => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    cuisine: dbRestaurant.cuisine || [],
    rating: parseFloat(dbRestaurant.rating) || 0,
    reviewCount: dbRestaurant.reviewCount || 0,
    deliveryTime: dbRestaurant.deliveryTime || '30-40 min',
    deliveryFee: parseFloat(dbRestaurant.deliveryFee) || 0,
    minOrder: parseFloat(dbRestaurant.minOrder) || 0,
    isOpen: dbRestaurant.isOpen !== false,
    imageUrl: dbRestaurant.imageUrl || '',
    address: dbRestaurant.address || '',
    coordinates: {
      latitude: parseFloat(dbRestaurant.latitude) || 0,
      longitude: parseFloat(dbRestaurant.longitude) || 0,
    },
    distance: dbRestaurant.distance || '0 mi',
    priceRange: dbRestaurant.priceRange || '$$',
    isFavorite: false,
    menu: [],
  };
};

const mapDatabaseMenuItemToMenuItem = (dbItem: any): MenuItem => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description || '',
    price: parseFloat(dbItem.price) || 0,
    imageUrl: dbItem.imageUrl || '',
    category: dbItem.category || '',
    isVegetarian: dbItem.isVegetarian || false,
    isVegan: dbItem.isVegan || false,
    isGlutenFree: dbItem.isGlutenFree || false,
    isAvailable: dbItem.isAvailable !== false,
    calories: dbItem.calories || 0,
    customizationGroups: [],
  };
};

const mapDatabaseOrderToOrder = (dbOrder: any, items: CartItem[] = []): Order => {
  return {
    id: dbOrder.id,
    userId: dbOrder.userId,
    restaurant: {
      id: dbOrder.restaurantId,
      name: '',
      cuisine: [],
      rating: 0,
      reviewCount: 0,
      deliveryTime: '',
      deliveryFee: 0,
      minOrder: 0,
      isOpen: true,
      imageUrl: '',
      address: '',
      coordinates: { latitude: 0, longitude: 0 },
      distance: '',
      priceRange: '',
      isFavorite: false,
      menu: [],
    },
    items,
    totalPrice: parseFloat(dbOrder.totalPrice) || 0,
    subtotal: parseFloat(dbOrder.subtotal) || 0,
    tax: parseFloat(dbOrder.tax) || 0,
    deliveryFee: parseFloat(dbOrder.deliveryFee) || 0,
    discount: parseFloat(dbOrder.discount) || 0,
    promoCode: dbOrder.promoCode,
    status: (dbOrder.status || 'pending') as OrderStatus,
    deliveryAddress: {
      id: dbOrder.deliveryAddressId || '',
      label: '',
      street: '',
      city: '',
      zipCode: '',
      coordinates: { latitude: 0, longitude: 0 },
      isDefault: false,
    },
    paymentMethod: {
      id: dbOrder.paymentMethodId || '',
      type: '',
      cardLast4: '',
      cardBrand: '',
      cardExpiry: '',
      isDefault: false,
    },
    estimatedDeliveryTime: dbOrder.estimatedDeliveryTime ? new Date(dbOrder.estimatedDeliveryTime) : new Date(),
    createdAt: dbOrder.created_at ? new Date(dbOrder.created_at) : new Date(),
    statusHistory: [],
    rating: dbOrder.rating,
    review: dbOrder.review,
    actualDeliveryTime: dbOrder.actualDeliveryTime ? new Date(dbOrder.actualDeliveryTime) : undefined,
    deliveryPartner: undefined,
  };
};

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  restaurants: [],
  selectedRestaurant: null,
  isLoadingRestaurants: false,

  cart: [],
  cartRestaurantId: null,

  orders: [],
  activeOrder: null,
  isLoadingOrders: false,

  favoriteRestaurantIds: [],

  searchQuery: '',
  selectedCuisines: [],
  dietaryFilters: [],
  sortBy: 'rating',

  appliedPromo: null,

  userLocation: null,
  selectedDeliveryAddress: null,

  // Restaurant actions
  fetchRestaurants: async () => {
    try {
      set({ isLoadingRestaurants: true });

      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('isOpen', true);

      if (error) throw error;

      const { data: favorites } = await supabase
        .from('userFavorites')
        .select('restaurantId');

      const favoriteIds = favorites?.map(f => f.restaurantId) || [];

      const mappedRestaurants = (restaurants || []).map(r => {
        const restaurant = mapDatabaseRestaurantToRestaurant(r);
        restaurant.isFavorite = favoriteIds.includes(r.id);
        return restaurant;
      });

      set({ restaurants: mappedRestaurants, isLoadingRestaurants: false });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      set({ isLoadingRestaurants: false });
    }
  },

  selectRestaurant: (id: string) => {
    const { restaurants } = get();
    const restaurant = restaurants.find(r => r.id === id) || null;
    set({ selectedRestaurant: restaurant });
  },

  // Cart actions
  addToCart: (item: MenuItem, quantity: number, customizations: SelectedCustomization[], instructions: string) => {
    const { cart, selectedRestaurant, cartRestaurantId } = get();

    // If cart has items from different restaurant, clear it
    if (cartRestaurantId && selectedRestaurant && cartRestaurantId !== selectedRestaurant.id) {
      set({ cart: [], cartRestaurantId: selectedRestaurant.id });
    }

    let itemTotal = item.price;
    customizations.forEach(c => {
      itemTotal += c.price;
    });
    itemTotal *= quantity;

    const cartItem: CartItem = {
      id: generateId(),
      menuItem: item,
      quantity,
      customizations,
      specialInstructions: instructions,
      totalPrice: itemTotal,
    };

    set({
      cart: [...cart, cartItem],
      cartRestaurantId: selectedRestaurant?.id || cartRestaurantId,
    });
  },

  updateCartItemQuantity: (cartItemId: string, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter(item => item.id !== cartItemId) });
    } else {
      set({
        cart: cart.map(item => {
          if (item.id === cartItemId) {
            let itemTotal = item.menuItem.price;
            item.customizations.forEach(c => {
              itemTotal += c.price;
            });
            itemTotal *= quantity;
            return { ...item, quantity, totalPrice: itemTotal };
          }
          return item;
        }),
      });
    }
  },

  removeFromCart: (cartItemId: string) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.id !== cartItemId);
    set({
      cart: newCart,
      cartRestaurantId: newCart.length === 0 ? null : get().cartRestaurantId,
    });
  },

  clearCart: () => {
    set({ cart: [], cartRestaurantId: null, appliedPromo: null });
  },

  // Order actions
  fetchOrders: async () => {
    try {
      set({ isLoadingOrders: true });

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        set({ isLoadingOrders: false });
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrders = (orders || []).map(o => mapDatabaseOrderToOrder(o));

      set({ orders: mappedOrders, isLoadingOrders: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ isLoadingOrders: false });
    }
  },

  placeOrder: async (deliveryAddress: Address, paymentMethod: PaymentMethod): Promise<Order> => {
    const { cart, cartRestaurantId, restaurants, appliedPromo } = get();

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const restaurant = restaurants.find(r => r.id === cartRestaurantId);
      if (!restaurant) throw new Error('Restaurant not found');

      const totals = get().getCartTotal();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          userId: session.session.user.id,
          restaurantId: cartRestaurantId,
          totalPrice: totals.total,
          subtotal: totals.subtotal,
          tax: totals.tax,
          deliveryFee: totals.deliveryFee,
          discount: totals.discount,
          promoCode: appliedPromo?.code,
          status: 'pending',
          deliveryAddressId: deliveryAddress.id,
          paymentMethodId: paymentMethod.id,
          estimatedDeliveryTime: new Date(Date.now() + 35 * 60000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // Insert order items
      for (const cartItem of cart) {
        const { error: itemError } = await supabase
          .from('orderItems')
          .insert({
            orderId: order.id,
            menuItemId: cartItem.menuItem.id,
            quantity: cartItem.quantity,
            specialInstructions: cartItem.specialInstructions,
            totalPrice: cartItem.totalPrice,
          });

        if (itemError) throw itemError;

        // Insert customizations
        for (const customization of cartItem.customizations) {
          const { data: orderItem } = await supabase
            .from('orderItems')
            .select('id')
            .eq('orderId', order.id)
            .eq('menuItemId', cartItem.menuItem.id)
            .single();

          if (orderItem) {
            await supabase
              .from('orderItemCustomizations')
              .insert({
                orderItemId: orderItem.id,
                groupId: customization.groupId,
                groupName: customization.groupName,
                optionId: customization.optionId,
                optionName: customization.optionName,
                price: customization.price,
              });
          }
        }
      }

      // Insert initial status history
      await supabase
        .from('orderStatusHistory')
        .insert({
          orderId: order.id,
          status: 'pending',
          message: 'Your order has been placed',
        });

      const newOrder = mapDatabaseOrderToOrder(order, cart);

      set(state => ({
        orders: [newOrder, ...state.orders],
        activeOrder: newOrder,
        cart: [],
        cartRestaurantId: null,
        appliedPromo: null,
      }));

      return newOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const { orders, activeOrder } = get();
    const now = new Date();

    const statusMessages: Record<OrderStatus, string> = {
      order_placed: 'Your order has been placed',
      restaurant_confirmed: 'Restaurant confirmed your order',
      preparing: 'Your food is being prepared',
      ready_for_pickup: 'Your order is ready for pickup',
      out_for_delivery: 'Your order is on the way!',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
      order_failed: 'There was an issue with your order',
      pending: 'Your order is pending',
    };

    const newHistoryItem: StatusHistoryItem = {
      status,
      timestamp: now,
      message: statusMessages[status],
    };

    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status,
          statusHistory: [...order.statusHistory, newHistoryItem],
          actualDeliveryTime: status === 'delivered' ? now : order.actualDeliveryTime,
        };
        return updatedOrder;
      }
      return order;
    });

    set({
      orders: updatedOrders,
      activeOrder: activeOrder?.id === orderId
        ? updatedOrders.find(o => o.id === orderId) || null
        : activeOrder,
    });

    // Update in database
    supabase
      .from('orders')
      .update({
        status,
        actualDeliveryTime: status === 'delivered' ? now.toISOString() : undefined,
      })
      .eq('id', orderId)
      .then(() => {
        supabase
          .from('orderStatusHistory')
          .insert({
            orderId,
            status,
            message: statusMessages[status],
          });
      });
  },

  setActiveOrder: (orderId: string) => {
    const { orders } = get();
    const order = orders.find(o => o.id === orderId) || null;
    set({ activeOrder: order });
  },

  rateOrder: async (orderId: string, rating: number, review: string) => {
    const { orders } = get();

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          rating,
          review,
        })
        .eq('id', orderId);

      if (error) throw error;

      set({
        orders: orders.map(order =>
          order.id === orderId ? { ...order, rating, review } : order
        ),
      });
    } catch (error) {
      console.error('Error rating order:', error);
    }
  },

  // Favorites
  toggleFavorite: async (restaurantId: string) => {
    const { favoriteRestaurantIds, restaurants } = get();
    const isFavorite = favoriteRestaurantIds.includes(restaurantId);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('userFavorites')
          .delete()
          .eq('userId', session.session.user.id)
          .eq('restaurantId', restaurantId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('userFavorites')
          .insert({
            userId: session.session.user.id,
            restaurantId,
          });

        if (error) throw error;
      }

      const newFavorites = isFavorite
        ? favoriteRestaurantIds.filter(id => id !== restaurantId)
        : [...favoriteRestaurantIds, restaurantId];

      set({
        favoriteRestaurantIds: newFavorites,
        restaurants: restaurants.map(r =>
          r.id === restaurantId ? { ...r, isFavorite: !isFavorite } : r
        ),
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  },

  // Search & Filters
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCuisines: (cuisines: string[]) => set({ selectedCuisines: cuisines }),
  setDietaryFilters: (filters: string[]) => set({ dietaryFilters: filters }),
  setSortBy: (sort) => set({ sortBy: sort }),

  // Promo
  applyPromoCode: async (code: string): Promise<boolean> => {
    try {
      const { data: promo, error } = await supabase
        .from('promoCodes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('isValid', true)
        .single();

      if (error || !promo) {
        return false;
      }

      // Check if promo has expired
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return false;
      }

      const mappedPromo: PromoCode = {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: parseFloat(promo.discountValue),
        minOrderAmount: promo.minOrderAmount ? parseFloat(promo.minOrderAmount) : 0,
        maxDiscount: promo.maxDiscount ? parseFloat(promo.maxDiscount) : undefined,
        expiresAt: promo.expiresAt ? new Date(promo.expiresAt) : undefined,
        isValid: promo.isValid,
      };

      set({ appliedPromo: mappedPromo });
      return true;
    } catch (error) {
      console.error('Error applying promo code:', error);
      return false;
    }
  },

  removePromoCode: () => set({ appliedPromo: null }),

  // Location
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedDeliveryAddress: (address) => set({ selectedDeliveryAddress: address }),

  // Computed
  getCartTotal: () => {
    const { cart, cartRestaurantId, restaurants, appliedPromo } = get();

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.0875; // 8.75% tax

    const restaurant = restaurants.find(r => r.id === cartRestaurantId);
    const deliveryFee = restaurant?.deliveryFee || 0;

    let discount = 0;
    if (appliedPromo && subtotal >= (appliedPromo.minOrderAmount || 0)) {
      if (appliedPromo.discountType === 'percentage') {
        discount = (subtotal * appliedPromo.discountValue) / 100;
        if (appliedPromo.maxDiscount) {
          discount = Math.min(discount, appliedPromo.maxDiscount);
        }
      } else {
        discount = appliedPromo.discountValue;
      }
    }

    const total = subtotal + tax + deliveryFee - discount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  getFilteredRestaurants: () => {
    const { restaurants, searchQuery, selectedCuisines, sortBy } = get();

    let filtered = [...restaurants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.some(c => c.toLowerCase().includes(query))
      );
    }

    // Cuisine filter
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(r =>
        r.cuisine.some(c => selectedCuisines.includes(c))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveryTime':
        filtered.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0]);
          const bTime = parseInt(b.deliveryTime.split('-')[0]);
          return aTime - bTime;
        });
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.priceRange.length - b.priceRange.length);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.priceRange.length - a.priceRange.length);
        break;
    }

    return filtered;
  },
}));