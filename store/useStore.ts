import { create } from 'zustand';
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

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    rating: 4.8,
    reviewCount: 324,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    address: '123 Food Street',
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    distance: '0.8 mi',
    priceRange: '$$',
    isFavorite: true,
    menu: [
      {
        id: 'cat1',
        name: 'Appetizers',
        items: [
          {
            id: 'item1',
            name: 'Bruschetta',
            description: 'Grilled bread topped with fresh tomatoes, basil, and garlic',
            price: 8.99,
            imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
            category: 'Appetizers',
            isVegetarian: true,
            isVegan: true,
            isGlutenFree: false,
            isAvailable: true,
            calories: 220,
            customizationGroups: [],
          },
          {
            id: 'item2',
            name: 'Calamari Fritti',
            description: 'Crispy fried calamari with marinara sauce',
            price: 12.99,
            imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
            category: 'Appetizers',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isAvailable: true,
            calories: 380,
            customizationGroups: [],
          },
        ],
      },
      {
        id: 'cat2',
        name: 'Pizza',
        items: [
          {
            id: 'item3',
            name: 'Margherita Pizza',
            description: 'Fresh mozzarella, tomato sauce, basil on wood-fired crust',
            price: 16.99,
            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            category: 'Pizza',
            isVegetarian: true,
            isVegan: false,
            isGlutenFree: false,
            isAvailable: true,
            calories: 850,
            customizationGroups: [
              {
                id: 'size',
                name: 'Size',
                required: true,
                maxSelections: 1,
                options: [
                  { id: 'small', name: 'Small (10")', price: 0, isDefault: true },
                  { id: 'medium', name: 'Medium (12")', price: 3, isDefault: false },
                  { id: 'large', name: 'Large (14")', price: 5, isDefault: false },
                ],
              },
              {
                id: 'toppings',
                name: 'Extra Toppings',
                required: false,
                maxSelections: 5,
                options: [
                  { id: 'pepperoni', name: 'Pepperoni', price: 2, isDefault: false },
                  { id: 'mushrooms', name: 'Mushrooms', price: 1.5, isDefault: false },
                  { id: 'olives', name: 'Black Olives', price: 1.5, isDefault: false },
                  { id: 'peppers', name: 'Bell Peppers', price: 1.5, isDefault: false },
                ],
              },
            ],
          },
          {
            id: 'item4',
            name: 'Quattro Formaggi',
            description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina',
            price: 18.99,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
            category: 'Pizza',
            isVegetarian: true,
            isVegan: false,
            isGlutenFree: false,
            isAvailable: true,
            calories: 920,
            customizationGroups: [
              {
                id: 'size',
                name: 'Size',
                required: true,
                maxSelections: 1,
                options: [
                  { id: 'small', name: 'Small (10")', price: 0, isDefault: true },
                  { id: 'medium', name: 'Medium (12")', price: 3, isDefault: false },
                  { id: 'large', name: 'Large (14")', price: 5, isDefault: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'cat3',
        name: 'Pasta',
        items: [
          {
            id: 'item5',
            name: 'Spaghetti Carbonara',
            description: 'Classic carbonara with guanciale, egg, pecorino, and black pepper',
            price: 17.99,
            imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
            category: 'Pasta',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isAvailable: true,
            calories: 780,
            customizationGroups: [],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    rating: 4.9,
    reviewCount: 567,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    minOrder: 20,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    address: '456 Sushi Lane',
    coordinates: { latitude: 37.7799, longitude: -122.4144 },
    distance: '1.2 mi',
    priceRange: '$$$',
    isFavorite: false,
    menu: [
      {
        id: 'cat1',
        name: 'Sushi Rolls',
        items: [
          {
            id: 'item1',
            name: 'Dragon Roll',
            description: 'Eel, cucumber, avocado, topped with eel sauce',
            price: 16.99,
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            category: 'Sushi Rolls',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isAvailable: true,
            calories: 420,
            customizationGroups: [],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Taco Fiesta',
    cuisine: ['Mexican', 'Tacos', 'Latin'],
    rating: 4.6,
    reviewCount: 234,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 12,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    address: '789 Taco Street',
    coordinates: { latitude: 37.7699, longitude: -122.4294 },
    distance: '0.5 mi',
    priceRange: '$',
    isFavorite: false,
    menu: [
      {
        id: 'cat1',
        name: 'Tacos',
        items: [
          {
            id: 'item1',
            name: 'Street Tacos (3)',
            description: 'Choice of carne asada, al pastor, or chicken on corn tortillas',
            price: 9.99,
            imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
            category: 'Tacos',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isAvailable: true,
            calories: 520,
            customizationGroups: [
              {
                id: 'protein',
                name: 'Protein',
                required: true,
                maxSelections: 1,
                options: [
                  { id: 'asada', name: 'Carne Asada', price: 0, isDefault: true },
                  { id: 'pastor', name: 'Al Pastor', price: 0, isDefault: false },
                  { id: 'chicken', name: 'Grilled Chicken', price: 0, isDefault: false },
                  { id: 'carnitas', name: 'Carnitas', price: 1, isDefault: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Golden Dragon',
    cuisine: ['Chinese', 'Asian', 'Dim Sum'],
    rating: 4.5,
    reviewCount: 412,
    deliveryTime: '25-35 min',
    deliveryFee: 2.49,
    minOrder: 15,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
    address: '321 Dragon Ave',
    coordinates: { latitude: 37.7949, longitude: -122.4044 },
    distance: '1.5 mi',
    priceRange: '$$',
    isFavorite: true,
    menu: [
      {
        id: 'cat1',
        name: 'Noodles',
        items: [
          {
            id: 'item1',
            name: 'Pad Thai',
            description: 'Stir-fried rice noodles with shrimp, peanuts, and lime',
            price: 14.99,
            imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
            category: 'Noodles',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isAvailable: true,
            calories: 680,
            customizationGroups: [],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    name: 'Burger Joint',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    rating: 4.4,
    reviewCount: 890,
    deliveryTime: '15-25 min',
    deliveryFee: 1.49,
    minOrder: 10,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    address: '555 Burger Blvd',
    coordinates: { latitude: 37.7649, longitude: -122.4344 },
    distance: '0.3 mi',
    priceRange: '$',
    isFavorite: false,
    menu: [
      {
        id: 'cat1',
        name: 'Burgers',
        items: [
          {
            id: 'item1',
            name: 'Classic Cheeseburger',
            description: 'Angus beef patty, cheddar, lettuce, tomato, special sauce',
            price: 11.99,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            category: 'Burgers',
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isAvailable: true,
            calories: 750,
            customizationGroups: [
              {
                id: 'patty',
                name: 'Patty',
                required: true,
                maxSelections: 1,
                options: [
                  { id: 'single', name: 'Single Patty', price: 0, isDefault: true },
                  { id: 'double', name: 'Double Patty', price: 4, isDefault: false },
                ],
              },
              {
                id: 'extras',
                name: 'Add Extras',
                required: false,
                maxSelections: 4,
                options: [
                  { id: 'bacon', name: 'Bacon', price: 2, isDefault: false },
                  { id: 'egg', name: 'Fried Egg', price: 1.5, isDefault: false },
                  { id: 'avocado', name: 'Avocado', price: 2, isDefault: false },
                  { id: 'jalapeno', name: 'Jalapeños', price: 0.5, isDefault: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'Fresh & Green',
    cuisine: ['Healthy', 'Salads', 'Vegan'],
    rating: 4.7,
    reviewCount: 189,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    minOrder: 15,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    address: '888 Healthy Way',
    coordinates: { latitude: 37.7899, longitude: -122.3994 },
    distance: '1.0 mi',
    priceRange: '$$',
    isFavorite: false,
    menu: [
      {
        id: 'cat1',
        name: 'Salads',
        items: [
          {
            id: 'item1',
            name: 'Mediterranean Bowl',
            description: 'Quinoa, chickpeas, cucumber, tomatoes, feta, olives, lemon vinaigrette',
            price: 13.99,
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            category: 'Salads',
            isVegetarian: true,
            isVegan: false,
            isGlutenFree: true,
            isAvailable: true,
            calories: 420,
            customizationGroups: [
              {
                id: 'protein',
                name: 'Add Protein',
                required: false,
                maxSelections: 1,
                options: [
                  { id: 'none', name: 'No Protein', price: 0, isDefault: true },
                  { id: 'chicken', name: 'Grilled Chicken', price: 4, isDefault: false },
                  { id: 'salmon', name: 'Grilled Salmon', price: 6, isDefault: false },
                  { id: 'tofu', name: 'Crispy Tofu', price: 3, isDefault: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const mockDeliveryPartner: DeliveryPartner = {
  id: 'dp1',
  name: 'Marcus Chen',
  phone: '+1 555-987-6543',
  avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  currentLocation: { latitude: 37.7749, longitude: -122.4194 },
  rating: 4.9,
  vehicleType: 'bike',
  vehiclePlate: 'BIKE-001',
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
  
  favoriteRestaurantIds: ['1', '4'],
  
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { favoriteRestaurantIds } = get();
      const restaurants = mockRestaurants.map(r => ({
        ...r,
        isFavorite: favoriteRestaurantIds.includes(r.id),
      }));
      
      set({ restaurants, isLoadingRestaurants: false });
    } catch (error) {
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return existing orders or empty array
      set({ isLoadingOrders: false });
    } catch (error) {
      set({ isLoadingOrders: false });
    }
  },

  placeOrder: async (deliveryAddress: Address, paymentMethod: PaymentMethod): Promise<Order> => {
    const { cart, cartRestaurantId, restaurants, appliedPromo } = get();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const restaurant = restaurants.find(r => r.id === cartRestaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    
    const totals = get().getCartTotal();
    
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 35 * 60000); // 35 minutes
    
    const newOrder: Order = {
      id: generateId(),
      userId: 'user1',
      restaurant,
      items: [...cart],
      totalPrice: totals.total,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      promoCode: appliedPromo?.code,
      status: 'order_placed',
      deliveryAddress,
      paymentMethod,
      estimatedDeliveryTime: estimatedDelivery,
      createdAt: now,
      statusHistory: [
        { status: 'order_placed', timestamp: now, message: 'Your order has been placed' },
      ],
    };
    
    set(state => ({ 
      orders: [newOrder, ...state.orders],
      activeOrder: newOrder,
      cart: [],
      cartRestaurantId: null,
      appliedPromo: null,
    }));
    
    // Simulate order progression
    setTimeout(() => {
      get().updateOrderStatus(newOrder.id, 'restaurant_confirmed');
    }, 5000);
    
    return newOrder;
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
          deliveryPartner: status === 'out_for_delivery' ? mockDeliveryPartner : order.deliveryPartner,
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
    
    // Continue simulation
    if (status === 'restaurant_confirmed') {
      setTimeout(() => get().updateOrderStatus(orderId, 'preparing'), 8000);
    } else if (status === 'preparing') {
      setTimeout(() => get().updateOrderStatus(orderId, 'ready_for_pickup'), 10000);
    } else if (status === 'ready_for_pickup') {
      setTimeout(() => get().updateOrderStatus(orderId, 'out_for_delivery'), 5000);
    } else if (status === 'out_for_delivery') {
      setTimeout(() => get().updateOrderStatus(orderId, 'delivered'), 15000);
    }
  },

  setActiveOrder: (orderId: string) => {
    const { orders } = get();
    const order = orders.find(o => o.id === orderId) || null;
    set({ activeOrder: order });
  },

  rateOrder: (orderId: string, rating: number, review: string) => {
    const { orders } = get();
    set({
      orders: orders.map(order =>
        order.id === orderId ? { ...order, rating, review } : order
      ),
    });
  },

  // Favorites
  toggleFavorite: (restaurantId: string) => {
    const { favoriteRestaurantIds, restaurants } = get();
    const isFavorite = favoriteRestaurantIds.includes(restaurantId);
    
    const newFavorites = isFavorite
      ? favoriteRestaurantIds.filter(id => id !== restaurantId)
      : [...favoriteRestaurantIds, restaurantId];
    
    set({
      favoriteRestaurantIds: newFavorites,
      restaurants: restaurants.map(r =>
        r.id === restaurantId ? { ...r, isFavorite: !isFavorite } : r
      ),
    });
  },

  // Search & Filters
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCuisines: (cuisines: string[]) => set({ selectedCuisines: cuisines }),
  setDietaryFilters: (filters: string[]) => set({ dietaryFilters: filters }),
  setSortBy: (sort) => set({ sortBy: sort }),

  // Promo
  applyPromoCode: async (code: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const validCodes: Record<string, PromoCode> = {
      'WELCOME20': {
        id: '1',
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 15,
        maxDiscount: 10,
        expiresAt: new Date('2025-12-31'),
        isValid: true,
      },
      'FREESHIP': {
        id: '2',
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 3.99,
        minOrderAmount: 20,
        expiresAt: new Date('2025-12-31'),
        isValid: true,
      },
    };
    
    const promo = validCodes[code.toUpperCase()];
    if (promo) {
      set({ appliedPromo: promo });
      return true;
    }
    return false;
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
    if (appliedPromo && subtotal >= appliedPromo.minOrderAmount) {
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