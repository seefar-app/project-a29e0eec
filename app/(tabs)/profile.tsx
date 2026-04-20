import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notAuthContainer}>
          <Ionicons name="person-circle-outline" size={80} color={colors.textMuted} />
          <Text style={[styles.notAuthTitle, { color: colors.text }]}>
            Sign in to view your profile
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };
  
  const menuItems = [
    {
      section: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => console.log('Edit Profile'),
        },
        {
          icon: 'location-outline',
          label: 'Saved Addresses',
          value: `${user.savedAddresses.length} addresses`,
          onPress: () => console.log('Saved Addresses'),
        },
        {
          icon: 'card-outline',
          label: 'Payment Methods',
          value: `${user.paymentMethods.length} methods`,
          onPress: () => console.log('Payment Methods'),
        },
        {
          icon: 'wallet-outline',
          label: 'Wallet Balance',
          value: `$${user.walletBalance.toFixed(2)}`,
          onPress: () => console.log('Wallet'),
        },
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          onPress: () => console.log('Language'),
        },
        {
          icon: 'globe-outline',
          label: 'Region',
          value: 'United States',
          onPress: () => console.log('Region'),
        },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          value: 'System',
          onPress: () => console.log('Dark Mode'),
        },
      ],
    },
    {
      section: 'Privacy & Security',
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Settings',
          onPress: () => console.log('Privacy'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => console.log('Change Password'),
        },
        {
          icon: 'finger-print-outline',
          label: 'Biometric Login',
          onPress: () => console.log('Biometric'),
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          onPress: () => console.log('Help'),
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Support',
          onPress: () => console.log('Support'),
        },
        {
          icon: 'document-text-outline',
          label: 'Terms & Conditions',
          onPress: () => console.log('Terms'),
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          onPress: () => console.log('Privacy Policy'),
        },
      ],
    },
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              imageUrl={user.avatar}
              name={user.name}
              size={80}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user.email}
              </Text>
              <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>
                {user.phone}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {user.referralCode}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Referral Code
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                Member
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Since {user.createdAt.getFullYear()}
              </Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              Notifications
            </Text>
          </View>
          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>
              All Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          {notificationsEnabled && (
            <>
              <View style={styles.notificationItem}>
                <Text style={[styles.notificationLabel, { color: colors.text }]}>
                  Email Notifications
                </Text>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={emailNotifications ? colors.primary : colors.textMuted}
                />
              </View>
              <View style={styles.notificationItem}>
                <Text style={[styles.notificationLabel, { color: colors.text }]}>
                  Push Notifications
                </Text>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={pushNotifications ? colors.primary : colors.textMuted}
                />
              </View>
              <View style={styles.notificationItem}>
                <Text style={[styles.notificationLabel, { color: colors.text }]}>
                  Order Updates
                </Text>
                <Switch
                  value={orderUpdates}
                  onValueChange={setOrderUpdates}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={orderUpdates ? colors.primary : colors.textMuted}
                />
              </View>
              <View style={styles.notificationItem}>
                <Text style={[styles.notificationLabel, { color: colors.text }]}>
                  Promotions & Offers
                </Text>
                <Switch
                  value={promotions}
                  onValueChange={setPromotions}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={promotions ? colors.primary : colors.textMuted}
                />
              </View>
            </>
          )}
        </Card>
        
        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.section}
            </Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index !== section.items.length - 1 && styles.menuItemBorder,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    item.onPress();
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color={colors.textSecondary} />
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.value && (
                      <Text style={[styles.menuItemValue, { color: colors.textMuted }]}>
                        {item.value}
                      </Text>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                </Pressable>
              ))}
            </Card>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="destructive"
            size="lg"
            fullWidth
            icon="log-out-outline"
          />
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  notAuthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 24,
  },
  notAuthTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notificationLabel: {
    fontSize: 15,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  menuCard: {
    marginHorizontal: 16,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    gap: 16,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
  },
});