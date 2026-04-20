import { create } from 'zustand';
import { User, Address, PaymentMethod } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  clearError: () => void;
}

const mockUser: User = {
  id: crypto.randomUUID(),
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1 555-123-4567',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  defaultAddressId: '1',
  savedAddresses: [
    {
      id: '1',
      label: 'Home',
      street: '123 Main Street, Apt 4B',
      city: 'San Francisco',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      street: '456 Market Street, Floor 10',
      city: 'San Francisco',
      zipCode: '94103',
      latitude: 37.7897,
      longitude: -122.4009,
      isDefault: false,
    },
  ],
  paymentMethods: [
    {
      id: '1',
      type: 'card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      cardExpiry: '12/26',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardLast4: '8888',
      cardBrand: 'Mastercard',
      cardExpiry: '08/25',
      isDefault: false,
    },
    {
      id: '3',
      type: 'wallet',
      isDefault: false,
    },
  ],
  walletBalance: 25.50,
  referralCode: 'ALEX2024',
  createdAt: new Date('2024-01-15'),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate credentials (mock)
      if (!email.includes('@') || password.length < 6) {
        set({ 
          isLoading: false, 
          authError: 'Invalid email or password. Please try again.' 
        });
        return false;
      }
      
      set({ 
        user: { ...mockUser, email },
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        authError: 'An error occurred. Please try again.' 
      });
      return false;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate inputs
      if (!email.includes('@')) {
        set({ isLoading: false, authError: 'Please enter a valid email address.' });
        return false;
      }
      if (password.length < 6) {
        set({ isLoading: false, authError: 'Password must be at least 6 characters.' });
        return false;
      }
      if (name.length < 2) {
        set({ isLoading: false, authError: 'Please enter your full name.' });
        return false;
      }
      
      const newUser: User = {
        ...mockUser,
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=200`,
        savedAddresses: [],
        paymentMethods: [],
        walletBalance: 0,
        referralCode: name.split(' ')[0].toUpperCase() + Math.floor(Math.random() * 10000),
        createdAt: new Date(),
      };
      
      set({ 
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        authError: 'An error occurred during signup. Please try again.' 
      });
      return false;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      authError: null,
    });
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Simulate checking stored auth token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, start unauthenticated
      set({ 
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      set({ 
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  addAddress: (address: Omit<Address, 'id'>) => {
    const { user } = get();
    if (user) {
      const newAddress: Address = {
        ...address,
        id: crypto.randomUUID(),
      };
      set({ 
        user: { 
          ...user, 
          savedAddresses: [...user.savedAddresses, newAddress] 
        } 
      });
    }
  },

  updateAddress: (id: string, updates: Partial<Address>) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          savedAddresses: user.savedAddresses.map(addr =>
            addr.id === id ? { ...addr, ...updates } : addr
          ),
        },
      });
    }
  },

  deleteAddress: (id: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          savedAddresses: user.savedAddresses.filter(addr => addr.id !== id),
        },
      });
    }
  },

  setDefaultAddress: (id: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          defaultAddressId: id,
          savedAddresses: user.savedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        },
      });
    }
  },

  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => {
    const { user } = get();
    if (user) {
      const newMethod: PaymentMethod = {
        ...method,
        id: crypto.randomUUID(),
      };
      set({
        user: {
          ...user,
          paymentMethods: [...user.paymentMethods, newMethod],
        },
      });
    }
  },

  deletePaymentMethod: (id: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          paymentMethods: user.paymentMethods.filter(pm => pm.id !== id),
        },
      });
    }
  },

  setDefaultPaymentMethod: (id: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          paymentMethods: user.paymentMethods.map(pm => ({
            ...pm,
            isDefault: pm.id === id,
          })),
        },
      });
    }
  },

  clearError: () => {
    set({ authError: null });
  },
}));