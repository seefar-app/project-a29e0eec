import { create } from 'zustand';
import { User, Address, PaymentMethod } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  clearError: () => void;
}

const mapDatabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || '',
    email: dbUser.email || '',
    phone: dbUser.phone || '',
    avatar: dbUser.avatar || '',
    defaultAddressId: dbUser.defaultAddressId || '',
    savedAddresses: [],
    paymentMethods: [],
    walletBalance: parseFloat(dbUser.walletBalance) || 0,
    referralCode: dbUser.referralCode || '',
    createdAt: new Date(dbUser.created_at),
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let friendlyMessage = 'Incorrect email or password. Please try again.';
        if (authError.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please confirm your email before logging in.';
        }
        set({ isLoading: false, authError: friendlyMessage });
        return false;
      }

      if (!authData.user) {
        set({ isLoading: false, authError: 'Login failed. Please try again.' });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ isLoading: false, authError: 'Failed to load user profile.' });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('userId', authData.user.id);

      const { data: paymentMethods } = await supabase
        .from('paymentMethods')
        .select('*')
        .eq('userId', authData.user.id);

      if (addresses) {
        user.savedAddresses = addresses.map((addr: any) => ({
          id: addr.id,
          label: addr.label || '',
          street: addr.street || '',
          city: addr.city || '',
          zipCode: addr.zipCode || '',
          latitude: parseFloat(addr.latitude) || 0,
          longitude: parseFloat(addr.longitude) || 0,
          isDefault: addr.isDefault || false,
        }));
      }

      if (paymentMethods) {
        user.paymentMethods = paymentMethods.map((pm: any) => ({
          id: pm.id,
          type: pm.type || 'card',
          cardLast4: pm.cardLast4 || '',
          cardBrand: pm.cardBrand || '',
          cardExpiry: pm.cardExpiry || '',
          isDefault: pm.isDefault || false,
        }));
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });

      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        authError: 'An error occurred. Please try again.',
      });
      return false;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });

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

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        let friendlyMessage = 'An error occurred during signup. Please try again.';
        if (error.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Password')) {
          friendlyMessage = 'Password must be at least 6 characters.';
        }
        set({ isLoading: false, authError: friendlyMessage });
        return false;
      }

      if (!authData.user) {
        set({ isLoading: false, authError: 'Signup failed. Please try again.' });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ isLoading: false, authError: 'Failed to create user profile.' });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);
      user.savedAddresses = [];
      user.paymentMethods = [];

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });

      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        authError: 'An error occurred during signup. Please try again.',
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
      });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile) {
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      const user = mapDatabaseUserToUser(profile);

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('userId', sessionData.session.user.id);

      const { data: paymentMethods } = await supabase
        .from('paymentMethods')
        .select('*')
        .eq('userId', sessionData.session.user.id);

      if (addresses) {
        user.savedAddresses = addresses.map((addr: any) => ({
          id: addr.id,
          label: addr.label || '',
          street: addr.street || '',
          city: addr.city || '',
          zipCode: addr.zipCode || '',
          latitude: parseFloat(addr.latitude) || 0,
          longitude: parseFloat(addr.longitude) || 0,
          isDefault: addr.isDefault || false,
        }));
      }

      if (paymentMethods) {
        user.paymentMethods = paymentMethods.map((pm: any) => ({
          id: pm.id,
          type: pm.type || 'card',
          cardLast4: pm.cardLast4 || '',
          cardBrand: pm.cardBrand || '',
          cardExpiry: pm.cardExpiry || '',
          isDefault: pm.isDefault || false,
        }));
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const updatePayload: any = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.phone !== undefined) updatePayload.phone = updates.phone;
      if (updates.avatar !== undefined) updatePayload.avatar = updates.avatar;
      if (updates.defaultAddressId !== undefined) updatePayload.defaultAddressId = updates.defaultAddressId;

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', currentUser.id);

      if (error) throw error;

      set({
        user: { ...currentUser, ...updates },
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  addAddress: async (address: Omit<Address, 'id'>) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          userId: currentUser.id,
          label: address.label,
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: address.isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;

      const newAddress: Address = {
        id: data.id,
        label: data.label || '',
        street: data.street || '',
        city: data.city || '',
        zipCode: data.zipCode || '',
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        isDefault: data.isDefault || false,
      };

      set({
        user: currentUser
          ? {
              ...currentUser,
              savedAddresses: [...currentUser.savedAddresses, newAddress],
            }
          : null,
      });
    } catch (error) {
      console.error('Error adding address:', error);
    }
  },

  updateAddress: async (id: string, updates: Partial<Address>) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const updatePayload: any = {};
      if (updates.label !== undefined) updatePayload.label = updates.label;
      if (updates.street !== undefined) updatePayload.street = updates.street;
      if (updates.city !== undefined) updatePayload.city = updates.city;
      if (updates.zipCode !== undefined) updatePayload.zipCode = updates.zipCode;
      if (updates.latitude !== undefined) updatePayload.latitude = updates.latitude;
      if (updates.longitude !== undefined) updatePayload.longitude = updates.longitude;
      if (updates.isDefault !== undefined) updatePayload.isDefault = updates.isDefault;

      const { error } = await supabase
        .from('addresses')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      set({
        user: currentUser
          ? {
              ...currentUser,
              savedAddresses: currentUser.savedAddresses.map(addr =>
                addr.id === id ? { ...addr, ...updates } : addr
              ),
            }
          : null,
      });
    } catch (error) {
      console.error('Error updating address:', error);
    }
  },

  deleteAddress: async (id: string) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        user: currentUser
          ? {
              ...currentUser,
              savedAddresses: currentUser.savedAddresses.filter(addr => addr.id !== id),
            }
          : null,
      });
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  },

  setDefaultAddress: async (id: string) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { error: updateUserError } = await supabase
        .from('users')
        .update({ defaultAddressId: id })
        .eq('id', currentUser.id);

      if (updateUserError) throw updateUserError;

      const { error: updateAddressesError } = await supabase
        .from('addresses')
        .update({ isDefault: false })
        .eq('userId', currentUser.id);

      if (updateAddressesError) throw updateAddressesError;

      const { error: setDefaultError } = await supabase
        .from('addresses')
        .update({ isDefault: true })
        .eq('id', id);

      if (setDefaultError) throw setDefaultError;

      set({
        user: currentUser
          ? {
              ...currentUser,
              defaultAddressId: id,
              savedAddresses: currentUser.savedAddresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id,
              })),
            }
          : null,
      });
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  },

  addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('paymentMethods')
        .insert({
          userId: currentUser.id,
          type: method.type,
          cardLast4: method.cardLast4 || null,
          cardBrand: method.cardBrand || null,
          cardExpiry: method.cardExpiry || null,
          isDefault: method.isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;

      const newMethod: PaymentMethod = {
        id: data.id,
        type: data.type || 'card',
        cardLast4: data.cardLast4 || '',
        cardBrand: data.cardBrand || '',
        cardExpiry: data.cardExpiry || '',
        isDefault: data.isDefault || false,
      };

      set({
        user: currentUser
          ? {
              ...currentUser,
              paymentMethods: [...currentUser.paymentMethods, newMethod],
            }
          : null,
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  },

  deletePaymentMethod: async (id: string) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { error } = await supabase
        .from('paymentMethods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        user: currentUser
          ? {
              ...currentUser,
              paymentMethods: currentUser.paymentMethods.filter(pm => pm.id !== id),
            }
          : null,
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  },

  setDefaultPaymentMethod: async (id: string) => {
    try {
      const { user: currentUser } = get();
      if (!currentUser) return;

      const { error: resetError } = await supabase
        .from('paymentMethods')
        .update({ isDefault: false })
        .eq('userId', currentUser.id);

      if (resetError) throw resetError;

      const { error: setError } = await supabase
        .from('paymentMethods')
        .update({ isDefault: true })
        .eq('id', id);

      if (setError) throw setError;

      set({
        user: currentUser
          ? {
              ...currentUser,
              paymentMethods: currentUser.paymentMethods.map(pm => ({
                ...pm,
                isDefault: pm.id === id,
              })),
            }
          : null,
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  },

  clearError: () => {
    set({ authError: null });
  },
}));