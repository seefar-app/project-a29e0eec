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
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleQuickAdd}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
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
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Customize</Text>
            <View style={{ width: 28 }} />
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
                        {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
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
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity(quantity + 1);
                  }}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
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
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  calories: {
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 240,
  },
  modalInfo: {
    padding: 20,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalItemDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  modalItemPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  customizationGroup: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  groupHeader: {
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupInfo: {
    fontSize: 13,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionPrice: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  instructionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantitySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});