import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/CartItem';

export function Cart() {
  const {
    cart,
    cartCount,
    cartTotal,
    deliveryCharge,
    gst,
    grandTotal,
    updateQuantity,
    removeFromCart
  } = useCart();

  // --- 1. EMPTY CART STATE ---
  if (cartCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.glassCard}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some fresh veggies to your cart</Text>
          
          <Link href="/shop" asChild>
            <TouchableOpacity style={styles.glowBtn}>
              <Text style={styles.btnText}>Explore Shop ✨</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  // --- 2. CART WITH ITEMS ---
  return (
    <ScrollView style={styles.mainContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>Your Cart</Text>

      <View style={styles.layout}>
        {/* Items List */}
        <View style={styles.itemsList}>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Items ({cartCount})</Text>
            <Text style={styles.value}>₹{cartTotal}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            {deliveryCharge === 0 ? (
              <Text style={styles.freeText}>FREE 🎉</Text>
            ) : (
              <Text style={styles.value}>₹{deliveryCharge}</Text>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GST (5%)</Text>
            <Text style={styles.value}>₹{gst}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
          </View>

          {deliveryCharge > 0 && (
            <Text style={styles.promoText}>
              🌱 Free delivery on orders above ₹199
            </Text>
          )}

          <Link href="/checkout" asChild>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: 10, paddingHorizontal: 16 }, // Reduced paddingTop since layout handles it
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' },
  glassCard: { backgroundColor: 'white', padding: 40, borderRadius: 32, alignItems: 'center', width: '90%', elevation: 4 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1C1E', marginBottom: 24 },
  layout: { flexDirection: 'column' },
  itemsList: { marginBottom: 24 },
  summaryCard: { backgroundColor: 'white', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2 },
  summaryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#1A1C1E', fontWeight: '600' },
  freeText: { fontSize: 14, color: '#16a34a', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1C1E' },
  grandTotalValue: { fontSize: 28, fontWeight: '800', color: '#16a34a' },
  promoText: { fontSize: 12, color: '#666', textAlign: 'center', marginVertical: 16 },
  glowBtn: { backgroundColor: '#16a34a', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  checkoutBtn: { backgroundColor: '#16a34a', paddingVertical: 18, borderRadius: 18, marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  checkoutText: { color: 'white', fontWeight: '900', fontSize: 18, textAlign: 'center' }
});