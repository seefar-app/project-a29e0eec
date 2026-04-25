import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset form with current user data
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
      }
      setErrors({});
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, user]);
  
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ name: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={handleCancel}
        >
          <Animated.View style={{ opacity: fadeAnim }} />
        </Pressable>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <Card style={[styles.modal, { backgroundColor: colors.background }]}>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="person-outline" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Edit Profile
                  </Text>
                </View>
                <Pressable
                  style={styles.closeButton}
                  onPress={handleCancel}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>
              
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Input
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  leftIcon="person-outline"
                  error={errors.name}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  leftIcon="mail-outline"
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <Input
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  leftIcon="call-outline"
                  error={errors.phone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Your email and phone number are used for account security and order notifications.
                  </Text>
                </View>
              </ScrollView>
              
              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="ghost"
                  size="lg"
                  style={styles.button}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  variant="primary"
                  size="lg"
                  loading={isSaving}
                  disabled={isSaving}
                  icon="checkmark"
                  style={styles.button}
                />
              </View>
            </Card>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 0,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: 500,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  button: {
    flex: 1,
  },
});