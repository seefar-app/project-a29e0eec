export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  defaultAddressId: string | null;
  savedAddresses: Address[];
  paymentMethods: PaymentMethod[];
  walletBalance: number;
  referralCode: string;
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  imageUrl: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  menu: MenuCategory[];
  isFavorite: boolean;
  distance: string;
  priceRange: '$' | '$$' | '$$$';
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  customizationGroups: CustomizationGroup[];
  calories?: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  specialInstructions: string;
  totalPrice: number;
}

export interface SelectedCustomization {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurant: Restaurant;
  items: CartItem[];
  totalPrice: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  promoCode?: string;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  deliveryPartner?: DeliveryPartner;
  rating?: number;
  review?: string;
  createdAt: Date;
  statusHistory: StatusHistoryItem[];
}

export type OrderStatus = 
  | 'order_placed'
  | 'restaurant_confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'order_failed';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: Date;
  message: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  vehicleType: 'bike' | 'scooter' | 'car';
  vehiclePlate: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  restaurantId: string;
  orderId: string;
  rating: number;
  text: string;
  imageUrls: string[];
  createdAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: Date;
  isValid: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order_update' | 'promo' | 'general';
  orderId?: string;
  isRead: boolean;
  createdAt: Date;
}