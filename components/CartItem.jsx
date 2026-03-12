import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import { X } from 'lucide-react-native';

/**
 * CartItem Component
 * Refactored to JSX (JavaScript)
 */
export function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <View style={styles.itemCard}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>{item.unit}</Text>
          <Text style={styles.metaText}> • </Text>
          <Text style={styles.metaText} numberOfLines={1}>{item.farmName}</Text>
        </View>
      </View>

      {/* Controls & Price */}
      <View style={styles.actionsContainer}>
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          
          <TouchableOpacity 
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            style={styles.qtyBtn}
          >
            <Text style={[styles.qtyBtnText, { color: '#16a34a' }]}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.priceText}>₹{item.price * item.quantity}</Text>

        <TouchableOpacity 
          onPress={() => onRemove(item.id)}
          style={styles.removeBtn}
        >
          <X size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  quantityValue: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  priceText: {
    width: 55,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  removeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
});