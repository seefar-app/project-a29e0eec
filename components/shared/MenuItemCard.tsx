import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { MenuItem, SelectedCustomization } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const { width } = Dimensions.get('window');

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { colors } = useTheme();
  const addToCart = useStore(state => state.addToCart);
  
  const [showCustomization, setShowCustomization] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleQuickAdd = () => {
    if (item.customizationGroups.length > 0) {
      setShowCustomization(true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addToCart(item, 1, [], '');
    }
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(item, quantity, selectedCustomizations, specialInstructions);
    setShowCustomization(false);
    setQuantity(1);
    setSelectedCustomizations([]);
    setSpecialInstructions('');
  };

  const handleCustomizationSelect = (groupId: string, groupName: string, optionId: string, optionName: string, price: number) => {
    const group = item.customizationGroups.find(g => g.id === groupId);
    if (!group) return;

    const existingCustomizations = selectedCustomizations.filter(c => c.groupId !== groupId);
    
    if (group.maxSelections === 1) {
      setSelectedCustomizations([
        ...existingCustomizations,
        { groupId, groupName, optionId, optionName, price },
      ]);
    } else {
      const groupCustomizations = selectedCustomizations.filter(c => c.groupId === groupId);
      if (groupCustomizations.some(c => c.optionId === optionId)) {
        setSelectedCustomizations(selectedCustomizations.filter(c => c.optionId !== optionId));
      } else if (groupCustomizations.length < group.maxSelections) {
        setSelectedCustomizations([
          ...selectedCustomizations,
          { groupId, groupName, optionId, optionName, price },
        ]);
      }
    }
  };

  const isCustomizationSelected = (groupId: string, optionId: string) => {
    return selectedCustomizations.some(c => c.groupId === groupId && c.optionId === optionId);
  };

  const calculateTotal = () => {
    let total = item.price;
    selectedCustomizations.forEach(c => {
      total += c.price;
    });
    return total * quantity;
  };

  const canAddToCart = () => {
    return item.customizationGroups
      .filter(g => g.required)
      .every(g => selectedCustomizations.some(c => c.groupId === g.id));
  };

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.meta}>
              <Text style={[styles.price, { color: colors.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
              {item.calories && (
                <Text style={[styles.calories, { color: colors.textMuted }]}>
                  {item.calories} cal
                </Text>
              )}
            </View>
            <View style={styles.badges}>
              {item.isVegetarian && <Badge label="Vegetarian" variant="success" size="sm" />}
              {item.isVegan && <Badge label="Vegan" variant="success" size="sm" />}
              {item.isGlutenFree && <Badge label="Gluten-Free" variant="info" size="sm" />}
              {!item.isAvailable && <Badge label="Unavailable" variant="error" size="sm" />}
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
            {item.isAvailable && (
              <Pressable
                style={[styles.addButton, { 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                }]}
                onPress={handleQuickAdd}
              >
                <Ionicons name="add" size={22} color="#ffffff" />
              </Pressable>
            )}
          </View>
        </View>
      </Card>

      <Modal
        visible={showCustomization}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomization(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowCustomization(false)}>
              <Ionicons name="close" size={30} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Customize</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: item.imageUrl }} style={styles.modalImage} contentFit="cover" />
            
            <View style={styles.modalInfo}>
              <Text style={[styles.modalItemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.modalItemDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
              <Text style={[styles.modalItemPrice, { color: colors.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>

            {item.customizationGroups.map(group => (
              <View key={group.id} style={styles.customizationGroup}>
                <View style={styles.groupHeader}>
                  <Text style={[styles.groupName, { color: colors.text }]}>
                    {group.name}
                    {group.required && <Text style={{ color: colors.error }}> *</Text>}
                  </Text>
                  <Text style={[styles.groupInfo, { color: colors.textMuted }]}>
                    {group.maxSelections === 1 ? 'Choose 1' : `Choose up to ${group.maxSelections}`}
                  </Text>
                </View>
                {group.options.map(option => {
                  const isSelected = isCustomizationSelected(group.id, option.id);
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.option,
                        { borderColor: colors.border },
                        isSelected && { borderColor: colors.primary, backgroundColor: colors.secondary },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleCustomizationSelect(group.id, group.name, option.id, option.name, option.price);
                      }}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionName, { color: colors.text }]}>
                          {option.name}
                        </Text>
                        {option.price > 0 && (
                          <Text style={[styles.optionPrice, { color: colors.textSecondary }]}>
                            +${option.price.toFixed(2)}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.radio,
                          { borderColor: colors.border },
                          isSelected && { borderColor: colors.primary, backgroundColor: colors.primary },
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={18} color="#ffffff" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <View style={styles.instructionsSection}>
              <Text style={[styles.instructionsLabel, { color: colors.text }]}>
                Special Instructions
              </Text>
              <Input
                placeholder="Add a note (e.g., no onions, extra sauce)"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.quantitySection}>
              <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity</Text>
              <View style={styles.quantityControls}>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    if (quantity > 1) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setQuantity(quantity - 1);
                    }
                  }}
                >
                  <Ionicons name="remove" size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity(quantity + 1);
                  }}
                >
                  <Ionicons name="add" size={22} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { 
            borderTopColor: colors.border, 
            backgroundColor: colors.card,
            shadowColor: colors.shadowStrong,
          }]}>
            <Button
              title={`Add to Cart • $${calculateTotal().toFixed(2)}`}
              onPress={handleAddToCart}
              disabled={!canAddToCart()}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  content: {
    flexDirection: 'row',
    gap: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  price: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  calories: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 260,
  },
  modalInfo: {
    padding: 24,
  },
  modalItemName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  modalItemDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  modalItemPrice: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  customizationGroup: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  groupHeader: {
    marginBottom: 14,
  },
  groupName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  groupInfo: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 10,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  optionPrice: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  instructionsLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  quantitySection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  quantityLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 22,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 12,
  },
});