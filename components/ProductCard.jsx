import React, { useState, memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export const ProductCard = memo(function ProductCard({
  product,
  isInCart,
  cartQuantity,
  onAdd,
  onUpdateQuantity
}) {
  const [isSparkling, setIsSparkling] = useState(false);

  const handleAdd = () => {
    setIsSparkling(true);
    onAdd(product);
    setTimeout(() => setIsSparkling(false), 600);
  };

  // FIXED: Now returns an object with hex colors instead of Tailwind strings
  const getBadgeStyle = (badge) => {
    const lowerBadge = badge.toLowerCase();
    
    if (lowerBadge.includes('organic') || lowerBadge.includes('fresh')) {
      return { text: '#16a34a', bg: '#DCFCE7' }; // Green
    }
    
    if (lowerBadge.includes('premium') || lowerBadge.includes('best')) {
      return { text: '#b45309', bg: '#FEF3C7' }; // Amber/Gold
    }
    
    return { text: '#ef4444', bg: '#FEE2E2' }; // Coral/Red
  };

  const badgeStyle = product.badge ? getBadgeStyle(product.badge) : null;

  return (
    <View style={styles.cardContainer}>
      {/* Badge */}
      {product.badge && (
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
            {product.badge}
          </Text>
        </View>
      )}

      {/* Product Image Area */}
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.productImage} 
          resizeMode="cover" 
        />
        <View style={styles.imageOverlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.farmName} numberOfLines={1}>
          {product.farmName}
        </Text>
        <Text style={styles.unitText}>
          {product.unit}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.priceText}>₹{product.price}</Text>

          <View style={styles.controlsContainer}>
            {!isInCart ? (
              <TouchableOpacity 
                style={styles.addBtn} 
                onPress={handleAdd}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>Add ✨</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityToggle}>
                <TouchableOpacity 
                  onPress={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                
                <Text style={styles.qtyNumber}>{cartQuantity}</Text>
                
                <TouchableOpacity 
                  onPress={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={[styles.qtyBtnText, { color: '#16a34a' }]}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  imageWrapper: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  farmName: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  unitText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16a34a',
  },
  controlsContainer: {
    width: 80,
    height: 36,
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    height: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    paddingHorizontal: 8,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  qtyNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});